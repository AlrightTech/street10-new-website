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
import type { Product } from "@/services/product.api";
import type { Category } from "@/services/category.api";

interface SimpleCarSliderProps {
  type?: "products" | "vendor";
}

function CarSlider({ type = "products" }: SimpleCarSliderProps) {
  const router = useRouter();
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Fetch categories that have products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productType = type === "vendor" ? "vendor" : "ecommerce";
        const response = await categoryApi.getWithProducts(productType);
        if (response.success && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [type]);

  // Note: Subcategories are not shown on homepage sections

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filters: {
          categoryId?: string;
        } = {};
        
        // On homepage, only filter by main category (no subcategories)
        if (selectedCategoryId) {
          filters.categoryId = selectedCategoryId;
        }
        
        const response =
          type === "vendor"
            ? await homeApi.getVendorOfferings(10, filters)
            : await homeApi.getFeaturedProducts(10, filters);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${type}] API Response:`, response);
        }
        
        // Response structure: { success: true, data: Product[], pagination: {...} }
        if (response && response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.warn(`[${type}] Invalid response structure:`, response);
          setProducts([]);
        }
      } catch (error: any) {
        // Log error details for debugging
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Error fetching ${type} products:`, {
            message: error?.message,
            code: error?.code,
            response: error?.response?.data,
            url: error?.config?.url,
            baseURL: error?.config?.baseURL
          });
          
          // Check if it's a timeout error
          if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            console.error(`[${type}] Request timed out. Please check if the backend is running on:`, error?.config?.baseURL);
          } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
            console.error(`[${type}] Network error. Backend may be unavailable at:`, error?.config?.baseURL);
          }
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type, selectedCategoryId]);

  // Handle product click - navigate to e-commerce product detail page
  const handleProductClick = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to dedicated product detail page for e-commerce products
    window.location.href = `/product-preview?id=${productId}`;
  };

  // Transform product data to match the car format
  const cars = products.map((product) => {
    const price = parseFloat(product.priceMinor) / 100;
    // Handle both nested (from home API) and flat (from products API) category structures
    const categoryName = (product.categories?.[0] as any)?.category?.name 
      || (product.categories?.[0] as any)?.name 
      || "General";
    return {
      id: product.id,
      src: product.media?.[0]?.url || "/images/street/simpleSlider-1.jpg",
      bid: `${price.toLocaleString()} QAR`,
      end: "Available",
      plate: product.title || "Product",
      provider: [
        "Provided by us",
        categoryName,
        "In Stock",
      ],
    };
  });

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
                  onClick={(e) => handleProductClick(e, car.id)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="relative w-full flex-shrink-0">
                    <Image
                      src={car.src}
                      alt={`Car ${index + 1}`}
                      width={400}
                      height={250}
                      className="w-full h-56 md:h-64 lg:h-72 object-cover"
                    />
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
                <p className="text-gray-500">No products available</p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Navigation Arrows */}
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
            window.location.href = "/e-commerce";
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
