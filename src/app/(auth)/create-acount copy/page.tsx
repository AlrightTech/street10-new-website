// app/register/page.tsx (Next.js 13+ App Router)
import React from "react";
import { TbArrowBackUp } from "react-icons/tb";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff] relative overflow-hidden">
      {/* Background wave shapes */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#f4f5f6] rounded-b-[50%]"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-[#dedee7] rounded-t-[50%]"></div>
        <div className="absolute bottom-0 left-0 w-2/5 h-2/6 bg-[#eee4db] rounded-t-[50%]"></div>
      </div>

      {/* Main form container */}
      <div className="relative  p-8 -mt-36 w-full mx-20 z-10">
        <TbArrowBackUp
          size={20}
          color="black"
          className="ms-2 cursor-pointer my-2"
        />

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#333333] mb-1">
          Let&apos;s build your account
        </h2>
        <p className="text-[#333333] text-sm mb-2">
          Provide some info to complete your account info
        </p>

        {/* Form */}
        <form className="space-y-4 bg-white rounded-xl shadow-md py-5 px-10">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter Your Name"
              className="w-full  rounded-md px-4 py-3 bg-[#f4f5f6] focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Nickname (Instagram username preferred)
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              className="w-full  rounded-md px-4 py-3 bg-[#f4f5f6] focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="f.ahmad898@gmail.com"
              className="w-full  rounded-md px-4 py-3 bg-[#f4f5f6] focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full  rounded-md px-4 py-3 bg-[#f4f5f6] focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center text-sm gap-2">
            <input
              type="radio"
              className="
      appearance-none cursor-pointer w-4 h-4 rounded-full 
      border-2 border-orange-500
      checked:border-4 checked:border-orange-500
      transition-all duration-200 ease-in-out transform 
      checked:scale-110
    "
            />

            <span className="text-gray-600">
              I agree to the <a href="#">terms of service</a> and{" "}
              <a href="#">Privacy policy</a>
            </span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#ee8e31] font-semibold cursor-pointer  text-white px-6 py-2 rounded-md"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
