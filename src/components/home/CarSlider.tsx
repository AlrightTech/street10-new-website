"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { FaArrowDown } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import {
  MdOutlineKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { homeApi } from "@/services/home.api";
import { categoryApi } from "@/services/category.api";
import type { Auction } from "@/services/auction.api";
import type { Category } from "@/services/category.api";

// Client-side only countdown timer to prevent hydration mismatch
const CountdownTimer = ({ targetDate, isScheduled = false }: { targetDate: Date; isScheduled?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        return isScheduled ? "Started" : "Ended";
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${days}d : ${hours}h : ${minutes}m`;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [targetDate, isScheduled]);

  // Render a placeholder or empty string during SSR
  if (!timeLeft) return <span className="opacity-0">Loading...</span>;

  return <span>{timeLeft}</span>;
};

function CarSlider() {
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories that have bidding products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getWithProducts('bidding');
        if (response.success && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Note: Subcategories are not shown on homepage sections

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const filters: {
          categoryId?: string;
        } = {};
        
        // On homepage, only filter by main category (no subcategories)
        if (selectedCategoryId) {
          filters.categoryId = selectedCategoryId;
        }
        
        const response = await homeApi.getFeaturedAuctions(10, filters);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auctions] API Response:', response);
          console.log('[Auctions] Response success:', response?.success);
          console.log('[Auctions] Response data:', response?.data);
          console.log('[Auctions] Data is array:', Array.isArray(response?.data));
          console.log('[Auctions] Data length:', response?.data?.length);
        }
        
        // Response structure: { success: true, data: Auction[], pagination: {...} }
        if (response && response.success && Array.isArray(response.data)) {
          console.log('[Auctions] Setting auctions, count:', response.data.length);
          setAuctions(response.data);
        } else {
          console.warn('[Auctions] Invalid response structure:', response);
          setAuctions([]);
        }
      } catch (error: any) {
        // Log error details for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn("Error fetching featured auctions:", {
            message: error?.message,
            code: error?.code,
            response: error?.response?.data,
            url: error?.config?.url,
            baseURL: error?.config?.baseURL
          });
          
          // Check if it's a timeout error
          if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            console.error('[Auctions] Request timed out. Please check if the backend is running on:', error?.config?.baseURL);
          } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
            console.error('[Auctions] Network error. Backend may be unavailable at:', error?.config?.baseURL);
          }
        }
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [selectedCategoryId]);

  const handleCarClick = (e: React.MouseEvent, carId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Use window.location.href for faster navigation to detail page
    window.location.href = `/car-preview?id=${carId}&type=auction`;
  };

  // Transform auction data to match the car format
  const cars = auctions.map((auction) => {
    const currentBid = auction.currentBid
      ? parseFloat(auction.currentBid.amountMinor) / 100
      : 0;
    
    // For scheduled auctions, show time until start
    // For live auctions, show time until end
    const isScheduled = auction.state === 'scheduled';
    const targetDate = isScheduled 
      ? new Date(auction.startAt) 
      : new Date(auction.endAt);
    
    return {
      id: auction.id,
      src: auction.product?.media?.[0]?.url || "/images/street/slider-1.jpg",
      bid: `${currentBid.toLocaleString()} QAR`,
      endDate: targetDate, // Pass date object for countdown
      isScheduled: isScheduled, // Flag to determine countdown label
      plate: auction.product?.title || "Auction Item",
      provider: ["Provided by us", "Auction", auction.state === 'scheduled' ? 'Scheduled' : 'Active'],
    };
  });

  // Build category items for CategoriesSlider - only if we have categories
  const categoryItems = categories.length > 0
    ? [
        { title: "All", icon: "/icons/categories.svg", id: null as string | null },
        ...categories.map(cat => ({
          title: cat.name,
          icon: cat.icon || "/icons/categories.svg",
          id: cat.id as string | null,
        })),
      ]
    : [];

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <>
      <section className="pt-5 pb-20 px-4 md:px-30 relative">
        {/* Category Tabs - Small, centered, with icons (no subcategories on homepage) */}
        {categories.length > 0 && (
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                  !selectedCategoryId
                    ? 'bg-[#EE8E32] text-white'
                    : 'bg-white text-[#4B4B4B] hover:bg-gray-100 shadow-[0px_1px_4px_0px_#0000001A]'
                }`}
              >
                <Image src="/icons/categories.svg" alt="All" width={14} height={14} />
                <span>All</span>
              </button>
              {categories.map(cat => {
                const iconUrl = (cat.langData as any)?.en?.iconUrl || cat.icon || "/icons/categories.svg";
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                      selectedCategoryId === cat.id
                        ? 'bg-[#EE8E32] text-white'
                        : 'bg-white text-[#4B4B4B] hover:bg-gray-100 shadow-[0px_1px_4px_0px_#0000001A]'
                    }`}
                  >
                    <Image src={iconUrl} alt={cat.name} width={14} height={14} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <Swiper
          modules={[Navigation]}
          slidesPerView={1}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation={{ prevEl, nextEl }}
          onBeforeInit={(swiper: SwiperType) => {
            if (
              swiper.params.navigation &&
              typeof swiper.params.navigation !== "boolean"
            ) {
              swiper.params.navigation.prevEl = prevEl;
              swiper.params.navigation.nextEl = nextEl;
            }
          }}
        >
          {loading ? (
            <SwiperSlide>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full p-4">
                <div className="animate-pulse">Loading...</div>
              </div>
            </SwiperSlide>
          ) : cars.length > 0 ? (
            cars.map((car, index) => (
              <SwiperSlide key={car.id || index}>
                <div
                  onClick={(e) => handleCarClick(e, car.id)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow cursor-pointer"
                >
                  {/* Image Section */}
                  <div className="relative w-full flex-shrink-0">
                    <Image
                      src={car.src}
                      alt={`Car ${index + 1}`}
                      width={400}
                      height={250}
                      className="w-full h-56 md:h-64 lg:h-72 object-cover"
                    />

                    {/* Top-right badges */}
                    <div className="flex gap-2 absolute top-3 right-3 md:top-4 md:right-4 pointer-events-none z-10">
                      <Image
                        src={"/icons/frwrd.svg"}
                        alt="forward"
                        width={36}
                        height={36}
                      />
                      <Image
                        src={"/icons/badge-1.svg"}
                        alt="badge"
                        width={36}
                        height={36}
                      />
                    </div>
                    {index == 0 && (
                      <div
                        className="absolute top-14 left-1/2 transform -translate-x-1/2
                      flex flex-col sm:flex-row items-center justify-between 
                      
                       w-[90%] sm:w-[85%] lg:w-[80%] pointer-events-none z-10"
                      >
                        <Image
                          src={"/images/street/FrameSlider.svg"}
                          width={400}
                          height={132}
                          alt="icon"
                          className=" w-full"
                        />
                      </div>
                    )}
                    <div
                      className="absolute bottom-3 left-1/2 transform -translate-x-1/2
                      flex flex-col sm:flex-row items-center justify-between gap-4
                      px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-white
                      bg-white/20 backdrop-blur-md shadow-lg w-[90%] sm:w-[85%] lg:w-[80%] pointer-events-none z-10"
                    >
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm">
                          {car.isScheduled ? 'Auction starts' : 'Auction ends'}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          <CountdownTimer targetDate={car.endDate} isScheduled={car.isScheduled} />
                        </p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-xs sm:text-sm">Current Bid</p>
                        <p className="text-sm font-medium mt-1">{car.bid}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t mt-auto flex flex-col justify-between">
                    <p className="text-[#333333] font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                      {car.plate}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {car.provider.map((info, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs sm:text-sm bg-white rounded-full text-[#666666] shadow-[0px_1px_4px_0px_#0000001A]"
                        >
                          {info}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full p-4">
                <p className="text-gray-500">No auctions available</p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Arrows bottom-right */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-4 z-10">
          <div
            ref={setPrevEl}
            className="cursor-pointer bg-white shadow-md rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <MdOutlineKeyboardArrowLeft size={20} />
          </div>
          <div
            ref={setNextEl}
            className="cursor-pointer bg-white shadow-md rounded-full h-8 w-8 md:h-10 md:w-10 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <MdKeyboardArrowRight size={20} />
          </div>
        </div>
      </section>

      <div className="flex justify-center my-10">
        <button
          onClick={() => {
            // Use window.location.href for faster navigation
            window.location.href = "/bidding";
          }}
          className="bg-[#EE8E32] cursor-pointer transition px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-[#d67a1f]"
        >
          Explore more <FaArrowDown className="animate-bounce" />
        </button>
      </div>
    </>
  );
}

export default CarSlider;
