"use client";
import Image from "next/image";
import React from "react";

const categories = [
  { name: "Cars", icon: "/icons/carLine.svg" },
  { name: "Art", icon: "/icons/cardArt.svg" },
  { name: "Vendors", icon: "/icons/deal.svg" },
  { name: "Car Services", icon: "/icons/service.svg" },
  { name: "Spare Parts", icon: "/icons/catalogue.svg" },
];

function Auction() {
  return (
    <div className="w-full px-20 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="w-full text-lg  flex flex-col items-center justify-center rounded-xl   
                       hover:shadow-md bg-white hover:bg-[#f6eae0] cursor-pointer hover:text-[#ee8e31] text-[#666666] font-medium px-6 py-8 transition-all duration-200"
          >
            <Image src={cat.icon} alt="icon" width={40} height={40} />
            <p className=" mt-3 ">{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Auction;
