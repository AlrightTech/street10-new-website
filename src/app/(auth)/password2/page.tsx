// app/auth/page.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

export default function AuthPage() {
  const [phone, setPhone] = useState("");

  return (
    <div className="flex h-screen  bg-[#f4f5f6]">
      {/* Left Section */}
      <div className="relative basis-[40%] hidden md:flex mt-5">
        <Image src="/images/street/login.png" alt="Car" fill priority />

        {/* Centered Heading */}
        <div className="relative z-10 flex  pt-45 w-full px-8">
          <h2 className="text-white text-5xl font-bold  leading-snug text-start">
            Best Bidding App <br /> For Cars & Its <br /> Spare Parts
          </h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 ">
        <h3 className="text-[#666666] text-md mb-2 font-medium">Password</h3>

        <input
          type="text"
          placeholder="Enter Password"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ee8e31] mb-4"
        />

        <button className="w-full cursor-pointer bg-[#ee8e31]  text-white py-2 rounded-md font-semibold mb-6">
          Next
        </button>

        <p className="text-center text-sm text-[#666666]">
          Forget Password?{" "}
          <a href="#" className="text-[#4C50A2] hover:underline">
            Reset
          </a>
        </p>
      </div>
    </div>
  );
}
