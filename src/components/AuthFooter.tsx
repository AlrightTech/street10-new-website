"use client";

import Image from "next/image";
import Link from "next/link";
import { MdLocalPhone } from "react-icons/md";

import { IoMail } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="w-full bg-white shadow-md  ">
      <div className="max-w-7xl  flex flex-col md:flex-row items-center justify-around gap-4  py-3 ">
        <div className="flex items-center gap-2">
          <Image src="/icons/logo.svg" alt="Logo" width={40} height={40} />
          <span className="font-medium text-[#101010] text-lg">
            Street10 mazaad
          </span>
        </div>

        {/* Center - Social */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="font-medium text-[#101010] text-lg">
            Join us social platform to stay updated
          </span>
          <div className="flex items-center gap-3">
            <Link href="https://linkedIn.com" target="_blank">
              <Image
                src="/icons/linkedin.svg"
                alt="LinkedIn"
                width={20}
                height={20}
              />
            </Link>
            <Link href="https://facebook.com" target="_blank">
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={20}
                height={20}
              />
            </Link>
          </div>
        </div>

        {/* Right - Contact */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-700">
          <span className="font-medium text-lg text-[#101010]">Contact</span>
          <div className="flex items-center text-[#4B4B4B] gap-1">
            <IoMail size={16} color="#4B4B4B" /> contact-us@street10.com
          </div>
          <div className="flex items-center gap-1 text-[#4B4B4B]">
            <MdLocalPhone size={16} color="#4B4B4B" /> +20 333 333 3333
          </div>
        </div>
      </div>
    </footer>
  );
}
