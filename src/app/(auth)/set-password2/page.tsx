// app/register/page.tsx (Next.js 13+ App Router)
import React from "react";
import { TbArrowBackUp } from "react-icons/tb";

export default function RegisterPage() {
  return (
    <div className=" h-screen flex pb-20 justify-center bg-[#ffffff] relative overflow-hidden">
      {/* Background wave shapes */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#f4f5f6] rounded-b-[50%]"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-[#dedee7] rounded-t-[50%]"></div>
        <div className="absolute bottom-0 left-0 w-2/5 h-2/6 bg-[#eee4db] rounded-t-[50%]"></div>
      </div>
      {/* Main form container */}
      <div className="relative  p-8  w-full mx-20 z-10">
        <TbArrowBackUp
          size={20}
          color="black"
          className="ms-2 cursor-pointer my-2"
        />

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#333333] mb-2">
          Create new password
        </h2>
        <p className="text-[#333333] text-sm mb-6">
          Your new password must be different from previous used passwords
        </p>

        {/* Form */}
        <form className="space-y-4 mt-26 bg-white rounded-xl shadow-md py-5 px-10 ">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full  rounded-md px-4 py-3 bg-[#f4f5f6] focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="Confirm your new password"
              className="w-full  rounded-md px-4 py-3 bg-[#f4f5f6] focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
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
