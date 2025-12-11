"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { authApi } from "@/services/auth.api";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";

export default function AuthPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  const dispatch = useDispatch();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Keep only one digit
    setOtp(newOtp);

    // Move focus to next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.verifyOTP({
        code: otpCode,
        phone: phone || undefined,
        email: email || undefined,
      });

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        dispatch(
          setUser({
            id: parseInt(response.data.user.id) || 0,
            first_name: "",
            last_name: "",
            email: response.data.user.email,
            email_verified_at: "",
            created_at: "",
            updated_at: "",
            role: response.data.user.role as "user" | "admin",
            avatar: "",
            status: response.data.user.status as "0" | "1",
            otp: null,
            otp_expires_at: null,
            add_interest: [],
            bible_version: "",
            age: "",
            is_profile_complete: "No",
            token: response.data.token,
          })
        );
        toast.success("Login successful!");
        
        // Check if user is a vendor (assuming role 'vendor' or similar logic)
        // The user requested: "once login will lead to https://street10-admin.vercel.app/dashboard"
        // I'll check if the role is 'vendor' or if we should just redirect everyone from this flow?
        // The user said "make sure vendor signup/login page is working... once login will lead to..."
        // I'll assume if role is 'vendor', redirect to admin dashboard.
        
        if (response.data.user.role === 'vendor') {
             // Vendor goes to admin panel (different domain)
             const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://street10-admin.vercel.app";
             window.location.href = `${baseUrl}/dashboard`;
        } else {
             // Customer stays on same domain - use router
             router.push("/");
        }
      }
    } catch (error: unknown) {
      console.error("Error verifying OTP:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex   h-[630] bg-[#f4f5f6]">
      {/* Left Section */}
      <div className="relative basis-[40%] hidden md:flex mt-3">
        <Image src="/images/street/otpImg.png" alt="Car" fill priority />

        <div className="relative z-10 flex pt-55 w-full px-8">
          <h2 className="text-white text-5xl font-bold leading-snug text-start">
            Smart Bidding By <br /> One Click
          </h2>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20">
        <h1 className="font-semibold text-xl text-black">6 digit code sent!</h1>
        <h3 className="text-[#666666] text-md mb-6 font-semibold mt-2">
          We&apos;ve sent an OTP to your{" "}
          {phone ? `number (${phone})` : email ? `email (${email})` : "contact"}
          , please enter the code here
        </h3>

        <div className="flex  justify-between mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }} // ✅ return void
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-15 h-15 bg-white text-center border border-[#ffdab7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ee8e31] text-lg"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full cursor-pointer bg-[#ee8e31] text-white py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
