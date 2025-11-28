"use client";
import Image from "next/image";
import Link from "next/link";
import { FaArrowDown } from "react-icons/fa";
import React from "react";

function Hero() {
  return (
    <div className="relative w-full h-[650px]">
      {/* Background Image */}
      <Image
        src="/images/cars/heroCar.jpg"
        alt="car"
        fill
        className="object-cover"
        priority
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
        <p className="text-sm tracking-widest uppercase relative mb-2">
          <span className="inline-block w-10 h-[1px] bg-white mr-3 align-middle"></span>
          Welcome to Street10 Mazad
          <span className="inline-block w-10 h-[1px] bg-white ml-3 align-middle"></span>
        </p>

        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Explore our brand <br /> new cars
        </h2>

        <p className="max-w-2xl text-base md:text-lg mb-8 text-gray-200">
          Car Auctions Inc. is the leading provider of car auctions in the
          country. We offer a wide variety of services to buyers and sellers,
          and we are committed to providing a fair and transparent platform for
          everyone involved.
        </p>

        <Link href="/bidding">
          <button className="bg-[#EE8E32] cursor-pointer transition px-8 py-3 rounded-lg text-white font-semibold flex items-center gap-2 hover:bg-[#d67a1f]">
            Explore more <FaArrowDown className="animate-bounce" />
          </button>
        </Link>
      </div>

      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
        <span className="w-3 h-3 rounded-full bg-[#EE8E32]"></span>
        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
      </div>
    </div>
  );
}

export default Hero;
