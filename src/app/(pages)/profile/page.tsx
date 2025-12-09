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
import { HiLanguage } from "react-icons/hi2";
import { IoLogOutOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { resetUser } from "@/redux/authSlice";
import { userApi, type User } from "@/services/user.api";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = [
    { name: "English", flag: "https://flagcdn.com/w20/us.png", code: "en" },
    { name: "Arabic", flag: "https://flagcdn.com/w20/sa.png", code: "ar" },
  ];

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is authenticated before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        // No token, redirect to login immediately
        toast.error("Please login to view your profile");
        router.push("/login");
        return;
      }

      // Try to load cached user data first
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error parsing cached user data:", error);
      }

      try {
        setLoading(true);
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        
        // Fetch wallet balance if available
        try {
          const { apiClient } = await import("@/services/api");
          const walletResponse = await apiClient.get("/wallet/balance");
          if (walletResponse.data.success && walletResponse.data.data) {
            // The response structure is: { success: true, data: { availableMinor: "...", ... } }
            const balanceData = walletResponse.data.data;
            const balance = parseFloat(balanceData.availableMinor || '0') / 100;
            setWalletBalance(balance.toFixed(2));
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          // Wallet might not be available for all users, so we don't show error
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        // If unauthorized or token invalid, redirect to login
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch(resetUser());
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        } else {
          // If we have cached user data, show it even if API fails
          if (!user) {
            toast.error(error.message || "Failed to load profile. Showing cached data.");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, dispatch]);

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

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageModalOpen(false);
    toast.success(`Language changed to ${language}`);
    // TODO: Save language preference to backend/localStorage
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

      {/* Back Icon and Profile Heading - Outside white background */}
      <div className="absolute top-0 left-0 z-10 px-4 md:px-6 pt-4 pb-2">
        <div className="flex flex-col">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-2"
            aria-label="Go back"
          >
            <Image
              src="/images/street/back-vector.png"
              alt="Back"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
          <h1 className="text-xl font-bold text-black">Profile</h1>
        </div>
      </div>

      {/* White Background Card */}
      <div className="relative z-10 mx-auto max-w-6xl w-full px-4 md:px-6 py-6 mt-16">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Request Button - Top Right */}
          <div className="flex justify-end mb-6">
            <button className="bg-[#EE8E32] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d87a28] transition">
              Request
            </button>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/images/avatar.png"
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full object-cover shadow-md border-2 border-[#EE8E32]"
            />
            <h2 className="mt-4 text-2xl font-bold text-black">
              {user.name || user.email.split('@')[0]}
            </h2>
            <p className="text-black font-semibold text-lg">@{user.email.split('@')[0]}</p>
            {user.customerType && (
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {user.customerType === 'verified' ? '✓ Verified Customer' : 
                 user.customerType === 'registered' ? 'Registered Customer' : 
                 'Guest'}
              </p>
            )}
          </div>

          {/* Menu List */}
          <div className="rounded-lg overflow-hidden space-y-5">
            {/* Balance */}
            <div className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
            <div className="flex items-center gap-3 text-[#666666]">
              <GoCreditCard size={18} />
              <span>Balance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#EE8E32] font-semibold">QAR {walletBalance}</span>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </div>

          {/* Profile Setting */}
          <Link href="/profile/settings">
            <div className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4">
              <div className="flex items-center gap-3 text-[#666666]">
                <FaRegUser size={16} />
                <span>Profile settings</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Bidding History */}
          <Link href="/bidding">
            <div className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4">
              <div className="flex items-center gap-3 text-[#666666]">
                <GoHistory size={16} />
                <span>Bidding History</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Order History */}
          <Link href="/order-history">
            <div className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4">
              <div className="flex items-center gap-3 text-[#666666]">
                <LuClock9 size={16} />
                <span>Order History</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Saved Items */}
          <Link href="/saved-items">
            <div className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4">
              <div className="flex items-center gap-3 text-[#666666]">
                <CiBookmark size={16} />
                <span>Saved items</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </Link>

          {/* Language */}
          <div 
            onClick={() => setIsLanguageModalOpen(true)}
            className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 "
          >
            <div className="flex items-center gap-3 text-[#666666]">
              <HiLanguage size={18} />
              <span>Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{selectedLanguage}</span>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </div>
        </div>

          {/* Sign Out Button */}
          <div className="mt-8 flex justify-start">
          <button 
            onClick={handleLogout}
            className="cursor-pointer flex items-center justify-center gap-2 bg-[#EE8E32] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#d87a28] transition"
          >
            <span>Sign Out</span>
            <MdKeyboardArrowRight size={18} className="text-white" />
          </button>
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {isLanguageModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsLanguageModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative">
              {/* Close Button */}
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <IoClose size={20} className="text-gray-600" />
              </button>

              {/* Language Options */}
              <div className="p-6 pt-6 space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 mt-6 rounded-lg transition text-left ${
                      selectedLanguage === lang.name
                        ? "bg-orange-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Image
                      src={lang.flag}
                      alt={lang.name}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span className="text-black font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

