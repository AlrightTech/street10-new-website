"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { CiBookmark } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { GoHistory } from "react-icons/go";
import { LuClock9 } from "react-icons/lu";
import { MdKeyboardArrowRight } from "react-icons/md";
import { GoCreditCard } from "react-icons/go";
import { resetUser } from "@/redux/authSlice";
import { userApi, type User } from "@/services/user.api";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<string>("0");

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        
        // Fetch wallet balance if available
        try {
          const { apiClient } = await import("@/services/api");
          const walletResponse = await apiClient.get("/wallet/balance");
          if (walletResponse.data.success && walletResponse.data.data) {
            const balance = parseFloat(walletResponse.data.data.availableMinor || '0') / 100;
            setWalletBalance(balance.toFixed(2));
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          // Wallet might not be available for all users, so we don't show error
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast.error(error.message || "Failed to load profile");
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load profile. Please try again.</p>
      </div>
    );
  }
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
            {user.name || user.email.split('@')[0]}
          </h2>
          <p className="text-black font-semibold">@{user.email.split('@')[0]}</p>
          {user.customerType && (
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {user.customerType === 'verified' ? '✓ Verified Customer' : 
               user.customerType === 'registered' ? 'Registered Customer' : 
               'Guest'}
            </p>
          )}
        </div>

        {/* Menu List */}
        <div className="mt-6 space-y-3">
          {/* Balance */}
          <div className="flex justify-between items-center bg-[#ffffff] px-4 py-5 rounded-md cursor-pointer hover:bg-gray-100">
            <div className="flex items-center gap-3 text-[#666666]">
              <GoCreditCard size={18} />
              <span>Balance</span>
            </div>
            <span className="text-[#EE8E32] font-semibold">QAR {walletBalance}</span>
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
