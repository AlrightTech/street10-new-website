"use client";
import { useState, useRef, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { authApi } from "@/services/auth.api";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";

const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes

function AuthPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown in seconds
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_MINUTES * 60); // Time remaining in seconds
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

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown} seconds before resending`);
      return;
    }

    if (!email && !phone) {
      toast.error("Email or phone is required");
      return;
    }

    try {
      setResendLoading(true);
      const result = await authApi.resendOTP({
        code: "", // Not needed for resend
        email: email || undefined,
        phone: phone || undefined,
      });

      if (result.success) {
        toast.success("Verification code has been resent");
        // Reset OTP input fields
        setOtp(["", "", "", "", "", ""]);
        // Reset timer to 10 minutes
        setTimeRemaining(OTP_EXPIRY_MINUTES * 60);
        // Set cooldown to 60 seconds (1 minute)
        setResendCooldown(60);
        // Focus first input
        inputsRef.current[0]?.focus();
      }
    } catch (error: unknown) {
      console.error("Error resending OTP:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(errorMessage || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

      if (response.success && response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        // Also store user in localStorage for Header component
        localStorage.setItem("user", JSON.stringify(response.data.user));
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
        
        // Dispatch custom event to notify Header component of auth state change
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("authStateChanged"));
        }
        
        // Check if user is a vendor (assuming role 'vendor' or similar logic)
        // The user requested: "once login will lead to https://street10-admin.vercel.app/dashboard"
        // I'll check if the role is 'vendor' or if we should just redirect everyone from this flow?
        // The user said "make sure vendor signup/login page is working... once login will lead to..."
        // I'll assume if role is 'vendor', redirect to admin dashboard.
        
        if (response.data.user.role === 'vendor') {
             // Vendor should manage account in admin panel only.
             // Log out from website context before redirecting to admin.
             if (typeof window !== "undefined") {
               localStorage.removeItem("token");
               localStorage.removeItem("refreshToken");
               localStorage.removeItem("user");
               window.dispatchEvent(new Event("authStateChanged"));
             }

             // Vendor goes to admin panel login page (different domain)
             const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://street10-admin.vercel.app";
             const email = encodeURIComponent(response.data.user.email || "");
             window.location.href = `${baseUrl}/login?email=${email}`;
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
    <div className="flex min-h-screen bg-[#f4f5f6]">
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
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-md">
          <h1 className="font-semibold text-xl text-black">6 digit code sent!</h1>
          <h3 className="text-[#666666] text-md mb-2 font-semibold mt-2">
            We&apos;ve sent an OTP to your{" "}
            {phone ? `number (${phone})` : email ? `email (${email})` : "contact"}
            , please enter the code here
          </h3>

          {/* Expiry Time Display */}
          <div className="mb-4 text-center">
            {timeRemaining > 0 ? (
              <p className="text-sm text-[#666666]">
                Code expires in:{" "}
                <span className={`font-semibold ${timeRemaining < 60 ? "text-red-500" : "text-[#ee8e31]"}`}>
                  {formatTime(timeRemaining)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-500 font-semibold">
                Code has expired. Please request a new one.
              </p>
            )}
          </div>

          <div className="flex justify-center gap-3 mb-4 w-full">
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
                className="w-10 h-10 md:w-12 md:h-12 bg-white text-center border border-[#ffdab7] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ee8e31] text-lg"
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || timeRemaining === 0}
            className="w-full cursor-pointer bg-[#ee8e31] text-white py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {loading ? "Verifying..." : timeRemaining === 0 ? "Code Expired" : "Verify"}
          </button>

          {/* Resend OTP Button */}
          <div className="text-center">
            <p className="text-sm text-[#666666] mb-2">
              {timeRemaining === 0 ? "Code expired?" : "Didn't receive the code?"}
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || resendCooldown > 0}
              className="text-[#ee8e31] font-semibold text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline transition"
            >
              {resendLoading
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#f4f5f6] items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <AuthPage />
    </Suspense>
  );
}
