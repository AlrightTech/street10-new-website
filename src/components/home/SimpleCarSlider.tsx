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
import CategoriesSlider from "../general/CategoriesSlider";
import { homeApi } from "@/services/home.api";
import type { Product } from "@/services/product.api";

const category = [
  { title: "", icon: "/icons/categories.svg" },

  { title: "Auctions", icon: "/icons/auction.svg" },
  { title: "Cars", icon: "/icons/car.svg" },
  { title: "Art", icon: "/icons/art.svg" },
  { title: "Numbers", icon: "/icons/file.svg" },
  { title: "Car Service", icon: "/icons/carService.svg" },
  { title: "Spare Parts", icon: "/icons/spareParts.svg" },
];

interface SimpleCarSliderProps {
  type?: "products" | "vendor";
}

function CarSlider({ type = "products" }: SimpleCarSliderProps) {
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response =
          type === "vendor"
            ? await homeApi.getVendorOfferings(10)
            : await homeApi.getFeaturedProducts(10);
        
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
            url: error?.config?.url
          });
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  // Transform product data to match the car format
  const cars = products.map((product) => {
    const price = parseFloat(product.priceMinor) / 100;
    return {
      id: product.id,
      src: product.media?.[0]?.url || "/images/street/simpleSlider-1.jpg",
      bid: `${price.toLocaleString()} QAR`,
      end: "Available",
      plate: product.title || "Product",
      provider: [
        "Provided by us",
        product.categories?.[0]?.name || "General",
        "In Stock",
      ],
    };
  });

  return (
    <>
      <section className="pt-5 pb-20 px-4 md:px-30 relative">
        <CategoriesSlider category={category} />

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
                <Link
                  href={`/car-preview?id=${car.id}&type=product`}
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
                </Link>
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
        <Link href="/e-commerce">
          <button className="bg-[#EE8E32] cursor-pointer transition px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-[#d67a1f]">
            Explore more <FaArrowDown className="animate-bounce" />
          </button>
        </Link>
      </div>
    </>
  );
}

export default CarSlider;
