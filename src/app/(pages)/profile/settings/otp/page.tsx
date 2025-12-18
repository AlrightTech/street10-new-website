"use client";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { userApi, type User } from "@/services/user.api";

export default function OTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get action type from query params
  const action = searchParams.get("action") || "phone"; // "phone" or "password"

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view this page");
        router.push("/login");
        return;
      }

      try {
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // Dispatch custom event to notify Header component of auth state change
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("authStateChanged"));
          }
          
          toast.error("Session expired. Please login again.");
          router.push("/login");
        }
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      // TODO: Verify OTP with backend
      // const { apiClient } = await import("@/services/api");
      // await apiClient.post("/auth/verify-otp", { otp: otpString, action });
      
      toast.success("OTP verified successfully");
      
      // Navigate based on action
      if (action === "password") {
        router.push("/profile/settings/change-password");
      } else {
        router.push("/profile/settings/change-phone");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid OTP. Please try again.");
      // Clear OTP on error
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const getMaskedPhone = () => {
    if (user?.phone) {
      const phone = user.phone;
      return phone.length > 3 ? `XX${phone.slice(-3)}` : "XX238";
    }
    return "XX238";
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
          <h1 className="text-2xl font-bold text-black">OTP</h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto max-w-md w-full px-4 md:px-6 py-6 mt-20">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          {/* Title */}
          <h2 className="text-xl font-bold text-black text-center">
            6 digit code sent!
          </h2>

          {/* Instructions */}
          <p className="text-sm text-black text-center">
            We&apos;ve sent an OTP to your number ({getMaskedPhone()}), please enter the code here
          </p>

          {/* OTP Input Fields */}
          <div className="flex items-center justify-center gap-2">
            {otp.map((digit, index) => (
              <React.Fragment key={index}>
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-[#EE8E32] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                />
                {index === 2 && (
                  <span className="text-[#EE8E32] font-bold text-xl mx-1">-</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-[#EE8E32] hover:bg-[#d87a28] text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

