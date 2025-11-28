// app/register/page.tsx
"use client";

import Image from "next/image";
import React from "react";
import { TbArrowBackUp } from "react-icons/tb";

export default function RegisterPage() {
  return (
    <div className="flex justify-center bg-[#ffffff] relative overflow-hidden min-h-screen">
      {/* Background wave shapes */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#f4f5f6] rounded-b-[50%]" />
        <div className="absolute bottom-0 right-0 w-3/4 sm:w-2/3 h-1/3 sm:h-1/2 bg-[#dedee7] rounded-t-[50%]" />
        <div className="absolute bottom-0 left-0 w-2/3 sm:w-2/5 h-1/4 sm:h-2/6 bg-[#eee4db] rounded-t-[50%]" />
      </div>

      {/* Main form container */}
      <div className="relative p-4 sm:p-6 md:p-8 w-full max-w-6xl z-10">
        <TbArrowBackUp
          size={24}
          color="black"
          className="ms-2 cursor-pointer my-2"
        />

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#333333] mb-2">
          Select top interests
        </h2>
        <p className="text-[#333333] text-xs sm:text-sm mb-6">
          It helps in your app experience and notifications
        </p>

        {/* Form */}
        <form className="space-y-6 mt-6 sm:mt-8 bg-white rounded-xl shadow-md py-5 px-4 sm:px-6 md:px-10">
          {/* Interests grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {[
              { label: "Auctions" },
              { label: "Cars" },
              { label: "Dealers" },
              { label: "Services" },
              { label: "Spare parts" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <Image
                  src={"/images/street/car.jpg"}
                  alt={item.label}
                  width={300}
                  height={121}
                  className="w-full h-[100px] sm:h-[120px] md:h-[140px] object-cover rounded-lg cursor-pointer"
                />
                <p className="text-white font-semibold ps-3 sm:ps-5 absolute top-2 left-0 text-base sm:text-lg md:text-xl">
                  + {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between sm:justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              className="w-full sm:w-auto bg-[#F3F5F6] font-semibold cursor-pointer px-6 sm:px-8 md:px-14 py-2 rounded-md text-center"
            >
              Skip
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#ee8e31] font-semibold cursor-pointer text-white px-6 sm:px-8 md:px-14 py-2 rounded-md text-center"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
