"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { CiBookmark } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { GoHistory } from "react-icons/go";
import { LuClock9 } from "react-icons/lu";
import { MdKeyboardArrowRight } from "react-icons/md";
import { GoCreditCard } from "react-icons/go";
import { resetUser } from "@/redux/authSlice";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Reset Redux state
    dispatch(resetUser());
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Redirect to login
    router.push("/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Profile Card */}
      <div className=" mx-auto w-4xl p-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <Image
            src="/images/avatar.png"
            alt="Profile"
            width={90}
            height={90}
            className="rounded-full object-cover shadow-md"
          />
          <h2 className="mt-3 text-lg font-medium text-gray-800">
            Farhan Ahmad
          </h2>
          <p className="text-black font-semibold">@F.Ahmad</p>
        </div>

        {/* Menu List */}
        <div className="mt-6 space-y-3">
          {/* Balance */}
          <div className="flex justify-between items-center bg-[#ffffff] px-4 py-5 rounded-md cursor-pointer hover:bg-gray-100">
            <div className="flex items-center gap-3 text-[#666666]">
              <GoCreditCard size={18} />
              <span>Balance</span>
            </div>
            <span className="text-[#EE8E32] font-semibold">QAR 2000</span>
          </div>

          {/* Profile Setting */}
          <Link href="/profile">
            <div className="flex justify-between items-center bg-[#ffffff] px-4 py-5 rounded-md cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-3 text-[#666666]">
                <FaRegUser size={16} />
                <span>Profile Setting</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Bidding History */}
          <Link href="/bidding">
            <div className="flex justify-between items-center bg-[#ffffff] px-4 py-5 rounded-md cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-3 text-[#666666]">
                <GoHistory size={16} />
                <span>Bidding History</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Order History */}
          <Link href="/order-history">
            <div className="flex justify-between items-center bg-[#ffffff] px-4 py-5 rounded-md cursor-pointer hover:bg-gray-100">
              <div className="flex items-center gap-3 text-[#666666]">
                <LuClock9 size={16} />
                <span>Order History</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Saved Items */}
          <div className="flex justify-between items-center bg-[#ffffff] px-4 py-5 rounded-md cursor-pointer hover:bg-gray-100">
            <div className="flex items-center gap-3 text-[#666666]">
              <CiBookmark size={16} />
              <span>Saved Items</span>
            </div>
            <MdKeyboardArrowRight color="#666666" size={20} />
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 flex justify-end ">
          <button 
            onClick={handleLogout}
            className=" cursor-pointer flex items-center justify-center gap-2 bg-gray-100 text-[#666666] font-medium px-4 py-3 rounded-md hover:bg-gray-200 transition"
          >
            Sign Out →
          </button>
        </div>
      </div>
    </div>
  );
}
