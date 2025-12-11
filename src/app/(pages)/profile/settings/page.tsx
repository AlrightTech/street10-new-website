"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { userApi, type User } from "@/services/user.api";

export default function ProfileSettings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    nickname: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view your profile");
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        
        // Set form data from user
        const initialData = {
          name: userData.name || userData.email?.split('@')[0] || "",
          nickname: userData.nickname || userData.email?.split('@')[0] || "",
          email: userData.email || "",
        };
        setFormData(initialData);
        setOriginalData(initialData);
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        } else {
          toast.error(error.message || "Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeInfoLogin = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChangePhoneNumber = () => {
    handleCloseModal();
    router.push("/profile/settings/otp?action=phone");
  };

  const handleChangePassword = () => {
    handleCloseModal();
    router.push("/profile/settings/otp?action=password");
  };

  const handleCancel = () => {
    // Reset form to original data
    setFormData(originalData);
    toast("Changes cancelled", { icon: "ℹ️" });
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      // TODO: Add API call to update user profile
      // const { apiClient } = await import("@/services/api");
      // await apiClient.put("/users/me", formData);
      
      // Update original data
      setOriginalData(formData);
      toast.success("Changes saved successfully");
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-3"
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
          <h1 className="text-2xl font-bold text-black">Profile Setting</h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto max-w-2xl w-full px-4 md:px-6 py-6 mt-24">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-6 w-full">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-normal text-black mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder:text-gray-400"
              placeholder="Enter your name"
            />
          </div>

          {/* Nickname Field */}
          <div>
            <label className="block text-sm font-normal text-black mb-2">
              Nickname (Instagram username preferred)
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder:text-gray-400"
              placeholder="Enter your nickname"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              To be shown to other users
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-normal text-black mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder:text-gray-400"
              placeholder="Enter your email"
            />
          </div>

          {/* Change Info Login Button */}
          <button
            onClick={handleChangeInfoLogin}
            className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <FaLock size={16} className="text-black" />
              <span className="text-black font-normal">Change info login</span>
            </div>
            <MdKeyboardArrowRight color="#666666" size={20} />
          </button>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-black font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-8 py-2.5 bg-[#EE8E32] hover:bg-[#d87a28] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Saved Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <IoClose size={24} className="text-gray-600" />
              </button>

              {/* Modal Options */}
              <div className="p-6 pt-8">
                {/* Change Phone Number */}
                <button
                  onClick={handleChangePhoneNumber}
                  className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition cursor-pointer text-left"
                >
                  <span className="text-black font-normal">Change Phone Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">
                      {user?.phone ? `xx${user.phone.slice(-2)}` : "xx23"}
                    </span>
                    <MdKeyboardArrowRight color="#666666" size={20} />
                  </div>
                </button>

                {/* Divider */}
                <div className="h-px bg-gray-200 my-2"></div>

                {/* Change Password */}
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between py-4 px-4 hover:bg-gray-50 rounded-lg transition cursor-pointer text-left"
                >
                  <span className="text-black font-normal">Change Password</span>
                  <MdKeyboardArrowRight color="#666666" size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

