"use client";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import StoryViewer, { type Story } from "./StoryViewer";

// Updated story data structure with multiple slides per story
const stories: Story[] = [
  {
    id: 1,
    title: "Luxury Sports Car",
    slides: [
      { image: "/images/cars/car-1.jpg", alt: "Luxury sports car front view", duration: 5000 },
      { image: "/images/cars/car-1.jpg", alt: "Luxury sports car interior", duration: 5000 },
    ],
  },
  {
    id: 2,
    title: "Classic Vintage",
    slides: [
      { image: "/images/cars/car-2.jpg", alt: "Classic vintage car", duration: 5000 },
    ],
  },
  {
    id: 3,
    title: "Modern Sedan",
    slides: [
      { image: "/images/cars/car-3.jpg", alt: "Modern sedan", duration: 5000 },
      { image: "/images/cars/car-3.jpg", alt: "Modern sedan dashboard", duration: 5000 },
    ],
  },
  {
    id: 4,
    title: "SUV Adventure",
    slides: [
      { image: "/images/cars/car-4.jpg", alt: "SUV adventure", duration: 5000 },
    ],
  },
  {
    id: 5,
    title: "Electric Vehicle",
    slides: [
      { image: "/images/cars/car-5.jpg", alt: "Electric vehicle", duration: 5000 },
      { image: "/images/cars/car-5.jpg", alt: "Electric vehicle charging", duration: 5000 },
    ],
  },
  {
    id: 6,
    title: "Convertible",
    slides: [
      { image: "/images/cars/car-6.jpg", alt: "Convertible car", duration: 5000 },
    ],
  },
  {
    id: 7,
    title: "Performance Car",
    slides: [
      { image: "/images/cars/car-7.jpg", alt: "Performance car", duration: 5000 },
      { image: "/images/cars/car-7.jpg", alt: "Performance car engine", duration: 5000 },
    ],
  },
  {
    id: 8,
    title: "Luxury Coupe",
    slides: [
      { image: "/images/cars/car-8.jpg", alt: "Luxury coupe", duration: 5000 },
    ],
  },
];

function CarCircle() {
  const prevRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

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
                      src={story.slides[0].image}
                      alt={story.slides[0].alt || story.title || `Story ${index + 1}`}
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
