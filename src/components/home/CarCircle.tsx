"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import StoryViewer, { type Story } from "./StoryViewer";
import { homeApi } from "@/services/home.api";

function CarCircle() {
  const prevRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await homeApi.getStoryHighlights(20);
        
        // Convert API response to Story format
        const convertedStories: Story[] = response.data.map((highlight) => {
          // Convert mediaUrls to slides
          const slides = (highlight.mediaUrls || []).map((url, index) => ({
            image: url,
            alt: highlight.title || `Story slide ${index + 1}`,
            duration: 5000, // Default 5 seconds
          }));

          // If no media URLs, use thumbnail as fallback
          if (slides.length === 0 && highlight.thumbnailUrl) {
            slides.push({
              image: highlight.thumbnailUrl,
              alt: highlight.title || "Story",
              duration: 5000,
            });
          }

          return {
            id: highlight.id,
            title: highlight.title,
            url: highlight.url || null, // Include URL from API response
            slides: slides.length > 0 ? slides : [
              {
                image: "/images/cars/car-1.jpg", // Fallback image
                alt: highlight.title || "Story",
                duration: 5000,
              },
            ],
          };
        });

        setStories(convertedStories);
      } catch (err: any) {
        console.error("Error fetching story highlights:", err);
        
        // Check if it's a timeout error
        if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
          console.error('[Story Highlights] Request timed out. Please check if the backend is running on:', err?.config?.baseURL);
          setError("Backend connection timeout. Please ensure the backend server is running.");
        } else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
          console.error('[Story Highlights] Network error. Backend may be unavailable at:', err?.config?.baseURL);
          setError("Cannot connect to backend server. Please check if the backend is running.");
        } else {
          setError(err.message || "Failed to load stories");
        }
        
        // Set empty array on error
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
    setIsStoryViewerOpen(true);
  };

  const handleCloseStoryViewer = () => {
    setIsStoryViewerOpen(false);
  };

  const handlePrev = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  if (isLoading) {
    return (
      <div className="w-full relative px-4 md:px-8 lg:px-12 pb-10">
        <div className="flex items-center justify-center py-10">
          <p className="text-gray-500">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full relative px-4 md:px-8 lg:px-12 pb-10">
        <div className="flex items-center justify-center py-10">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null; // Don't show anything if no stories
  }

  return (
    <>
      <div className="w-full relative px-4 md:px-8 lg:px-12 pb-10">
        <div
          ref={prevRef}
          onClick={handlePrev}
          className="absolute left-0 md:left-4 top-[65px] -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition"
        >
          <MdOutlineKeyboardArrowLeft size={20} className="text-gray-700" />
        </div>

        <div
          ref={nextRef}
          onClick={handleNext}
          className="absolute right-0 md:right-4 top-[65px] -translate-y-1/2 z-10 cursor-pointer bg-white rounded-full h-8 w-8 flex items-center justify-center shadow-md hover:bg-gray-100 transition"
        >
          <MdKeyboardArrowRight size={20} className="text-gray-700" />
        </div>
        <Swiper
          modules={[Navigation]}
          spaceBetween={1}
          onSwiper={(swiper) => {
            setSwiperInstance(swiper);
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper: SwiperType) => {
            if (
              swiper.params.navigation &&
              typeof swiper.params.navigation !== "boolean"
            ) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 2 },
            768: { slidesPerView: 4, spaceBetween: 3 },
            1024: { slidesPerView: 5, spaceBetween: 1 },
            1280: { slidesPerView: 7, spaceBetween: 1 },
          }}
        >
          {stories.map((story, index) => (
            <SwiperSlide key={story.id}>
              <div
                onClick={() => handleStoryClick(index)}
                className="block cursor-pointer"
              >
                <div className="w-[130px] h-[130px] rounded-full p-1 bg-gradient-to-r from-[#766CDF] via-[#B78BB2] to-[#DD9F84] flex items-center justify-center mx-auto hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                    <Image
                      src={story.slides[0]?.image || "/images/cars/car-1.jpg"}
                      alt={story.slides[0]?.alt || story.title || `Story ${index + 1}`}
                      width={130}
                      height={130}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Story Viewer Modal */}
      <StoryViewer
        stories={stories}
        initialStoryIndex={selectedStoryIndex}
        isOpen={isStoryViewerOpen}
        onClose={handleCloseStoryViewer}
      />
    </>
  );
}

export default CarCircle;
