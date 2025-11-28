import Image from "next/image";
import React from "react";
import { IoIosArrowRoundForward } from "react-icons/io";

const TopHeader = () => {
  return (
    <header className="bg-[#4C50A2] text-white h-16 w-full flex items-center px-4 md:px-6">
      {/* Logo - Left */}
      <div className="flex-shrink-0">
        <Image src="/icons/logo.svg" alt="Logo" width={40} height={40} />
      </div>

      {/* Center Content */}
      <div className="flex-1 flex justify-center">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs sm:text-sm md:text-base text-center md:text-left">
          <p className="flex items-center gap-2">
            <Image
              src="/icons/solar_cup-outline.svg"
              alt="Cup"
              width={18}
              height={18}
            />
            Congrats, you&apos;ve claimed the auction
          </p>
          <p className="flex gap-3 items-center ">
            Kindly submit or go to the office in 4h : 2m for your item{" "}
            <IoIosArrowRoundForward size={30} />
          </p>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
