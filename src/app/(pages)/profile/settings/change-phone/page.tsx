"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function ChangePhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+974");
  const [saving, setSaving] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Ensure it starts with +974
    if (!value.startsWith("+974")) {
      value = "+974" + value.replace(/^\+974/, "");
    }
    
    // Only allow numbers after +974
    const numbersOnly = value.replace(/[^0-9+]/g, "");
    if (numbersOnly.startsWith("+974")) {
      setPhone(numbersOnly);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 8) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setSaving(true);
      // TODO: Add API call to change phone number
      // const { apiClient } = await import("@/services/api");
      // await apiClient.put("/users/change-phone", { phone });
      
      toast.success("Phone number changed successfully");
      router.push("/profile/settings");
    } catch (error: any) {
      console.error("Error changing phone number:", error);
      toast.error(error.message || "Failed to change phone number");
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-black">Change phone number</h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto max-w-md w-full px-4 md:px-6 py-6 mt-20">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          {/* Card Title */}
          <h2 className="text-xl font-bold text-black">
            Change phone number
          </h2>

          {/* Instructions */}
          <p className="text-sm text-black">
            Provide the new phone number you&apos;ll use for future logins
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-normal text-black mb-2">
                Sign in/up with your phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder:text-gray-400"
                placeholder="+974"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-[#EE8E32] hover:bg-[#d87a28] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

