"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import {
  MdOutlineKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { categoryApi } from "@/services/category.api";
import type { Category } from "@/services/category.api";

interface CategoriesSliderProps {
  category?: {
    icon: string;
    title?: string;
    id?: string | null;
  }[];
  useApi?: boolean;
  onCategoryClick?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

function CategoriesSlider({
  category: propCategory,
  useApi = false,
  onCategoryClick,
  selectedCategoryId,
}: CategoriesSliderProps) {
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (useApi) {
      const fetchCategories = async () => {
        try {
          const response = await categoryApi.getTree();
          setCategories(response.data || []);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        }
      };

      fetchCategories();
    }
  }, [useApi]);

  // Use API categories if useApi is true, otherwise use prop categories
  // Only show categories if we have them
  const category = useApi
    ? (categories.length > 0
        ? categories.map((cat) => ({
            icon: cat.icon || "/icons/categories.svg",
            title: cat.name,
          }))
        : [])
    : (propCategory && propCategory.length > 0 ? propCategory : []);

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

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-center gap-3">
        {/* Left Arrow */}
        <div
          ref={setPrevEl}
          onClick={handlePrev}
          className="cursor-pointer bg-white shadow-md rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition flex-shrink-0 mb-10"
        >
          <MdOutlineKeyboardArrowLeft size={18} className="text-[#3B3E9E]" />
        </div>

        <Swiper
          modules={[Navigation]}
          slidesPerView={5}
          spaceBetween={1}
          onSwiper={(swiper) => {
            setSwiperInstance(swiper);
          }}
          breakpoints={{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
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
          className="w-200 flex-1"
        >
          {category.length === 0 ? (
            <SwiperSlide>
              <span className="px-4 py-2 flex items-center justify-center mb-10 gap-2 text-sm bg-white rounded-full text-[#4B4B4B] mx-2 shadow-[0px_1px_4px_0px_#0000001A]">
                No categories
              </span>
            </SwiperSlide>
          ) : (
            category.map((item, idx) => {
              // Determine if this category is selected
              const categoryId =
                ('id' in item && item.id !== undefined) ? item.id : idx === 0 ? null : undefined;
              const isSelected =
                selectedCategoryId !== undefined
                  ? selectedCategoryId === categoryId
                  : false;

              return (
                <SwiperSlide key={idx}>
                  <span
                    onClick={() => {
                      if (onCategoryClick) {
                        onCategoryClick(categoryId || null);
                      }
                    }}
                    className={`px-4 py-2 cursor-pointer flex items-center justify-center mb-10 gap-2 
                      text-sm rounded-full mx-2 
                      shadow-[0px_1px_4px_0px_#0000001A] hover:shadow-md transition ${
                        isSelected
                          ? "bg-[#EE8E32] text-white"
                          : "bg-white text-[#4B4B4B]"
                      }`}
                  >
                    <Image
                      src={item?.icon}
                      alt="icon"
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                    />
                    {/* agar text ho tabhi show ho */}
                    {item?.title && (
                      <span className="whitespace-nowrap">{item?.title}</span>
                    )}
                  </span>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>

        {/* Right Arrow */}
        <div
          ref={setNextEl}
          onClick={handleNext}
          className="cursor-pointer bg-white shadow-md rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-100 transition flex-shrink-0 mb-10"
        >
          <MdKeyboardArrowRight size={18} className="text-[#3B3E9E]" />
        </div>
      </div>
    </div>
  );
}

export default CategoriesSlider;
