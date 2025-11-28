"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className=" flex items-center justify-between px-10  bg-white w-full">
      <Image src="/icons/logo.svg" alt="Logo" width={50} height={50} />

      <Link
        href="/signup"
        className="bg-[#ee8e31]  cursor-pointer text-white px-8 py-3 rounded-md font-semibold  transition"
      >
        Join Us
      </Link>
    </div>
  );
}
