"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowDown } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import VerificationModal from "../ui/VerificationModal";
import { homeApi } from "@/services/home.api";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[];
  type: 'image' | 'video';
  url: string | null;
  buttonText: string | null;
  buttonLink: string | null;
}

function Hero() {
  const router = useRouter();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [showGetVerified, setShowGetVerified] = useState(false);
  const [customerType, setCustomerType] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoadingBanner(true);
        const bannerData = await homeApi.getBanners(5); // Get up to 5 banners
        if (bannerData && bannerData.length > 0) {
          setBanners(bannerData);
          setBanner(bannerData[0]); // Set first banner as default
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Fallback to default banner if API fails
      } finally {
        setIsLoadingBanner(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners every 5 seconds if multiple banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => {
          const nextIndex = (prev + 1) % banners.length;
          setBanner(banners[nextIndex]);
          return nextIndex;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setShowGetVerified(false);
        setCustomerType(null);
        return;
      }

      const userData = JSON.parse(userStr);
      const type = userData?.customerType;
      setCustomerType(type);

      if (type === "registered" || type === "verification_pending") {
        setShowGetVerified(true);
      } else {
        // verified or anything else -> hide button
        setShowGetVerified(false);
      }
    } catch (error) {
      console.error("Error reading user in Hero:", error);
      setShowGetVerified(false);
      setCustomerType(null);
    }
  }, []);

  const handleGetVerifiedClick = () => {
    if (customerType === "verification_pending") {
      // Show pending modal instead of redirecting
      setIsVerificationModalOpen(true);
    } else {
      // Not yet submitted - go to upload page
      window.location.href = "/upload-cnic";
    }
  };

  const handleBannerClick = () => {
    if (banner?.url) {
      if (banner.url.startsWith('http://') || banner.url.startsWith('https://')) {
        window.location.href = banner.url;
      } else {
        window.location.href = banner.url;
      }
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (banner?.buttonLink) {
      if (banner.buttonLink.startsWith('http://') || banner.buttonLink.startsWith('https://')) {
        window.location.href = banner.buttonLink;
      } else {
        window.location.href = banner.buttonLink;
      }
    } else {
      // Default fallback
      window.location.href = "/bidding";
    }
  };

  // Get banner image URL
  const getBannerImage = () => {
    if (banner?.mediaUrls && banner.mediaUrls.length > 0) {
      return banner.mediaUrls[0];
    }
    if (banner?.thumbnailUrl) {
      return banner.thumbnailUrl;
    }
    return "/images/cars/heroCar.jpg"; // Fallback
  };

  // Get banner text content
  const subtitle = banner?.subtitle || "Welcome to Street10 Mazad";
  const title = banner?.title || "Explore our brand new cars";
  const description = banner?.description || "Car Auctions Inc. is the leading provider of car auctions in the country. We offer a wide variety of services to buyers and sellers, and we are committed to providing a fair and transparent platform for everyone involved.";
  const buttonText = banner?.buttonText || "Explore more";

  return (
    <div className="relative w-full h-[650px] cursor-pointer" onClick={handleBannerClick}>
      {/* Background Image */}
      <Image
        src={getBannerImage()}
        alt={title}
        fill
        className="object-cover"
        priority
        onError={(e) => {
          // Fallback to default image if banner image fails to load
          const target = e.target as HTMLImageElement;
          target.src = "/images/cars/heroCar.jpg";
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
        {subtitle && (
          <p className="text-sm tracking-widest uppercase relative mb-2">
            <span className="inline-block w-10 h-[1px] bg-white mr-3 align-middle"></span>
            {subtitle}
            <span className="inline-block w-10 h-[1px] bg-white ml-3 align-middle"></span>
          </p>
        )}

        {title && (
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {title.includes('\n') ? (
              // If title has explicit line breaks, use them
              title.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < title.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))
            ) : (
              // Otherwise, split into two lines intelligently
              (() => {
                const words = title.split(' ')
                // Find a good split point - prefer splitting after "brand", "new", etc.
                let splitIndex = Math.ceil(words.length / 2)
                // Try to find a better split point after common words
                const preferredSplitWords = ['brand', 'new', 'our', 'the', 'and']
                for (let i = Math.floor(words.length / 3); i < Math.ceil(words.length * 2 / 3); i++) {
                  if (preferredSplitWords.includes(words[i]?.toLowerCase())) {
                    splitIndex = i + 1
                    break
                  }
                }
                // For "Explore our brand new cars", split after "brand" (index 2) -> splitIndex = 3
                const firstLine = words.slice(0, splitIndex).join(' ')
                const secondLine = words.slice(splitIndex).join(' ')
                return (
                  <>
                    {firstLine}
                    {secondLine && <><br />{secondLine}</>}
                  </>
                )
              })()
            )}
          </h2>
        )}

        {description && (
          <p className="max-w-2xl text-base md:text-lg mb-8 text-gray-200">
            {description}
          </p>
        )}

        <div className="flex flex-col items-center gap-3">
          {buttonText && (
            <button
              onClick={handleButtonClick}
              className="w-[180px] h-[48px] bg-[#EE8E32] cursor-pointer transition px-8 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#d67a1f]"
            >
              {buttonText} <FaArrowDown className="animate-bounce" />
            </button>
          )}

          {/* Show Get Verified only for non-verified customers */}
          {showGetVerified && (
            <button
              onClick={handleGetVerifiedClick}
              className="w-[180px] h-[48px] border-2 border-[#EE8E32] bg-transparent cursor-pointer transition px-8 py-3 rounded-lg text-[#EE8E32] font-semibold flex items-center justify-center hover:bg-[#EE8E32] hover:text-white"
            >
              Get Verified
            </button>
          )}
        </div>
      </div>

      {/* Banner Navigation Dots (if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentBannerIndex(index);
                setBanner(banners[index]);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex ? 'bg-[#EE8E32]' : 'bg-gray-300'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        context="bidding"
        state={customerType === "verification_pending" ? "pending" : "need_verification"}
      />
    </div>
  );
}

export default Hero;
