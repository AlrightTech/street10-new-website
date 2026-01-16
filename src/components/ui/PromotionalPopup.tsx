"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { homeApi } from "@/services/home.api";

interface Popup {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  redirectType: 'product' | 'category' | 'external';
  redirectTarget: string | null;
  ctaText: string | null;
  startDate: string;
  endDate: string;
  priority: 'high' | 'medium' | 'low';
  deviceTarget: 'desktop' | 'mobile' | 'both';
}

interface PromotionalPopupProps {
  onClose?: () => void;
}

export default function PromotionalPopup({ onClose }: PromotionalPopupProps) {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        setIsLoading(true);
        // Detect device type
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const deviceType = isMobile ? 'mobile' : 'desktop';
        
        const popups = await homeApi.getPopups(deviceType);
        
        if (popups && popups.length > 0) {
          const activePopup = popups[0]; // Get highest priority popup
          
          // Check if popup was already dismissed
          const dismissedPopups = JSON.parse(
            localStorage.getItem('dismissedPopups') || '[]'
          );
          
          if (!dismissedPopups.includes(activePopup.id)) {
            setPopup(activePopup);
            // Small delay for smooth animation
            setTimeout(() => setIsVisible(true), 100);
          }
        }
      } catch (error) {
        console.error("Error fetching popup:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (popup) {
        // Mark popup as dismissed in localStorage
        const dismissedPopups = JSON.parse(
          localStorage.getItem('dismissedPopups') || '[]'
        );
        if (!dismissedPopups.includes(popup.id)) {
          dismissedPopups.push(popup.id);
          localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups));
        }
      }
      setPopup(null);
      onClose?.();
    }, 300); // Wait for fade-out animation
  };

  const handlePopupClick = () => {
    if (!popup || !popup.redirectTarget) return;

    let redirectUrl = popup.redirectTarget;
    
    // All redirect types now use URLs directly
    // If it's a relative URL (starts with /), use it as-is
    // If it's an external URL without protocol, add https://
    if (!redirectUrl.startsWith('/') && !redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = `https://${redirectUrl}`;
    }

    if (redirectUrl) {
      // Close popup first
      handleClose();
      // Then navigate after a small delay to allow close animation
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    }
  };


  if (isLoading || !popup) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden pointer-events-auto transform transition-all duration-300 ${
            isVisible ? 'scale-100' : 'scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
            aria-label="Close popup"
          >
            <IoClose className="h-5 w-5 text-gray-700" />
          </button>

          {/* Popup Content */}
          <div className="flex flex-col">
            {/* Image - Clickable */}
            {popup.imageUrl && (
              <div 
                className={`relative w-full h-48 sm:h-64 bg-gray-100 ${popup.redirectTarget ? 'cursor-pointer' : ''}`}
                onClick={popup.redirectTarget ? handlePopupClick : undefined}
              >
                <Image
                  src={popup.imageUrl}
                  alt={popup.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Text Content */}
            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">{popup.title}</h3>
              
              {popup.description && (
                <p className="text-gray-600 leading-relaxed">{popup.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
