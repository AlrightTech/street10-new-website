"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface StorySlide {
  image: string;
  alt?: string;
  duration?: number; // Duration in milliseconds, default 5000
}

export interface Story {
  id: string | number;
  slides: StorySlide[];
  title?: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SLIDE_DURATION = 5000; // 5 seconds

export default function StoryViewer({
  stories,
  initialStoryIndex,
  isOpen,
  onClose,
}: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const swipeThreshold = 50; // Minimum swipe distance

  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides[currentSlideIndex];
  const slideDuration = currentSlide?.duration || DEFAULT_SLIDE_DURATION;

  // Reset when story changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStoryIndex(initialStoryIndex);
      setCurrentSlideIndex(0);
      setProgress(0);
      setIsPaused(false);
      setIsLoading(true);
    }
  }, [isOpen, initialStoryIndex]);

  // Clear timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Go to next slide
  const goToNextSlide = useCallback(() => {
    if (!currentStory) return;

    if (currentSlideIndex < currentStory.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setProgress(0);
      pausedTimeRef.current = 0;
    } else {
      // Move to next story
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
        setCurrentSlideIndex(0);
        setProgress(0);
        pausedTimeRef.current = 0;
      } else {
        // Loop back to first story
        setCurrentStoryIndex(0);
        setCurrentSlideIndex(0);
        setProgress(0);
        pausedTimeRef.current = 0;
      }
    }
    setIsLoading(true);
  }, [currentStory, currentSlideIndex, currentStoryIndex, stories.length]);

  // Start progress animation
  const startProgress = useCallback(() => {
    clearTimers();
    setProgress(0);
    startTimeRef.current = Date.now() - pausedTimeRef.current;

    progressIntervalRef.current = setInterval(() => {
      if (!isPaused && currentStory && currentSlide) {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / slideDuration) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearTimers();
          goToNextSlide();
        }
      }
    }, 16); // ~60fps updates
  }, [isPaused, currentStory, currentSlide, slideDuration, goToNextSlide, clearTimers]);

  // Go to previous slide
  const goToPreviousSlide = useCallback(() => {
    if (!currentStory) return;

    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setProgress(0);
      pausedTimeRef.current = 0;
    } else {
      // Move to previous story
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
        const prevStory = stories[currentStoryIndex - 1];
        setCurrentSlideIndex(prevStory.slides.length - 1);
        setProgress(0);
        pausedTimeRef.current = 0;
      } else {
        // Loop to last story
        const lastStory = stories[stories.length - 1];
        setCurrentStoryIndex(stories.length - 1);
        setCurrentSlideIndex(lastStory.slides.length - 1);
        setProgress(0);
        pausedTimeRef.current = 0;
      }
    }
    setIsLoading(true);
  }, [currentStory, currentSlideIndex, currentStoryIndex, stories]);

  // Handle pause/resume
  const handlePause = useCallback(() => {
    if (!isPaused) {
      pausedTimeRef.current = Date.now() - startTimeRef.current;
      setIsPaused(true);
      clearTimers();
    }
  }, [isPaused, clearTimers]);

  const handleResume = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      startProgress();
    }
  }, [isPaused, startProgress]);

  // Handle swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    handlePause();
  }, [handlePause]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartXRef.current || !touchStartYRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (absDeltaX > absDeltaY && absDeltaX > swipeThreshold) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        goToPreviousSlide();
      } else {
        // Swipe left - go to next
        goToNextSlide();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > swipeThreshold && deltaY > 0) {
      // Swipe down - close
      onClose();
    } else {
      // Resume if no significant swipe
      handleResume();
    }

    touchStartXRef.current = 0;
    touchStartYRef.current = 0;
  }, [goToNextSlide, goToPreviousSlide, onClose, handleResume]);

  // Start/restart progress when slide changes
  useEffect(() => {
    if (isOpen && currentStory && currentSlide && !isPaused) {
      startProgress();
    }
    return () => clearTimers();
  }, [isOpen, currentStoryIndex, currentSlideIndex, isPaused, currentStory, currentSlide, startProgress, clearTimers]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          goToNextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPreviousSlide();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNextSlide, goToPreviousSlide, onClose]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  if (!isOpen || !currentStory || !currentSlide) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Close on background click (but not on content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 pb-2">
        <div className="flex gap-1 max-w-4xl mx-auto">
          {currentStory.slides.map((_, index) => (
            <div
              key={index}
              className="h-1 bg-white/20 rounded-full flex-1 overflow-hidden backdrop-blur-sm"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-75 ease-linear shadow-lg"
                style={{
                  width:
                    index < currentSlideIndex
                      ? "100%"
                      : index === currentSlideIndex
                      ? `${progress}%`
                      : "0%",
                  opacity: index === currentSlideIndex ? 1 : index < currentSlideIndex ? 0.8 : 0.5,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 text-white hover:bg-white/20 active:bg-white/30 rounded-full p-2.5 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm"
        aria-label="Close story viewer"
      >
        <X size={24} strokeWidth={2.5} />
      </button>

      {/* Story Content */}
      <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-8">
        {/* Left Navigation Area */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 sm:w-1/4 cursor-pointer z-20 flex items-center justify-start pl-2 sm:pl-4 md:pl-8"
          onClick={(e) => {
            e.stopPropagation();
            goToPreviousSlide();
          }}
        >
          <div className="bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg sm:opacity-100">
            <ChevronLeft size={28} className="text-white sm:w-8 sm:h-8" strokeWidth={2.5} />
          </div>
        </div>

        {/* Center Image */}
        <div className="relative w-full h-full flex items-center justify-center max-w-5xl mx-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-lg" />
            </div>
          )}
          <div className="relative w-full h-full animate-in fade-in duration-300">
            <Image
              src={currentSlide.image}
              alt={currentSlide.alt || `Story ${currentStoryIndex + 1} - Slide ${currentSlideIndex + 1}`}
              fill
              className="object-contain transition-opacity duration-300"
              priority
              onLoad={handleImageLoad}
              onLoadingComplete={handleImageLoad}
              quality={90}
            />
          </div>
        </div>

        {/* Right Navigation Area */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 sm:w-1/4 cursor-pointer z-20 flex items-center justify-end pr-2 sm:pr-4 md:pr-8"
          onClick={(e) => {
            e.stopPropagation();
            goToNextSlide();
          }}
        >
          <div className="bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg sm:opacity-100">
            <ChevronRight size={28} className="text-white sm:w-8 sm:h-8" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Story Title (optional) */}
      {currentStory.title && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 text-white text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 sm:px-6 sm:py-3 shadow-xl border border-white/10">
            <p className="text-base sm:text-lg md:text-xl font-semibold">{currentStory.title}</p>
          </div>
        </div>
      )}

      {/* Mobile Navigation Hints */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 sm:hidden text-white/60 text-xs text-center px-4 animate-pulse">
        <p>Tap sides to navigate • Swipe to close</p>
      </div>
    </div>
  );
}

