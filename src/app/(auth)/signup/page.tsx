"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authApi } from "@/services/auth.api";
import { loginScreenApi } from "@/services/login-screen.api";
import Link from "next/link";
import { FiUpload, FiX } from "react-icons/fi";

const DEFAULT_BACKGROUND = "/images/street/build-your-account.png";

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"customer" | "vendor">("customer");
  const [loading, setLoading] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(DEFAULT_BACKGROUND);
  const customerImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBackground = async () => {
      const screen = await loginScreenApi.getActiveLoginScreen("registration");
      if (screen?.backgroundUrl) {
        setBackgroundImageUrl(screen.backgroundUrl);
      }
    };
    fetchBackground();
  }, []);
  
  // Customer Form State
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    image: null as File | null,
  });

  // Customer Form Errors
  const [customerErrors, setCustomerErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData({ ...customerData, [name]: value });
    // Clear error when user starts typing
    if (customerErrors[name as keyof typeof customerErrors]) {
      setCustomerErrors({ ...customerErrors, [name]: "" });
    }
  };

  const handleCustomerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload PNG or JPG files only");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setCustomerData({ ...customerData, image: file });
    }
  };

  const removeCustomerImage = () => {
    setCustomerData({ ...customerData, image: null });
    if (customerImageInputRef.current) {
      customerImageInputRef.current.value = "";
    }
  };


  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setCustomerErrors({ name: "", email: "", phone: "", password: "" });
    
    // Validate required fields with specific error messages
    let hasErrors = false;
    const newErrors = { name: "", email: "", phone: "", password: "" };

    if (!customerData.name?.trim()) {
      newErrors.name = "Name is required";
      hasErrors = true;
    }
    if (!customerData.email?.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }
    if (!customerData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
      hasErrors = true;
    }
    if (!customerData.password) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (customerData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasErrors = true;
    }

    if (hasErrors) {
      setCustomerErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      // Note: Profile image upload requires authentication, so we skip it during signup
      // User can upload profile image after registration in profile settings
      // For now, we'll register without profile image
      const response = await authApi.register({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        password: customerData.password,
        profileImageUrl: undefined, // Skip image during signup - can be uploaded later
        provider: "email",
      });
      
      // If registration successful and image was provided, try to upload it after login
      // (This is optional - user can also upload later in profile settings)
      if (customerData.image && response.success && response.data?.user) {
        // Store image in localStorage temporarily to upload after redirect
        // Or just skip it - user can upload in profile settings
        console.log('Profile image can be uploaded after login in profile settings');
      }

      // Check if response indicates an error
      if (response.success === false || !response.success) {
        const errorMessage = (response as any).error || "Signup failed";
        
        // Map backend errors to specific fields
        const newErrors = { name: "", email: "", phone: "", password: "" };
        
        if (errorMessage.toLowerCase().includes("email already exists") || 
            errorMessage.toLowerCase().includes("user with this email")) {
          newErrors.email = "This email is already registered. Please use a different email or log in.";
        } else if (errorMessage.toLowerCase().includes("phone already exists") ||
                   errorMessage.toLowerCase().includes("user with this phone")) {
          newErrors.phone = "This phone number is already registered. Please use a different phone number.";
        } else if (errorMessage.toLowerCase().includes("email")) {
          newErrors.email = errorMessage;
        } else if (errorMessage.toLowerCase().includes("phone")) {
          newErrors.phone = errorMessage;
        } else if (errorMessage.toLowerCase().includes("password")) {
          newErrors.password = errorMessage;
        } else {
          // Show general error in toast if it's not field-specific
          toast.error(errorMessage);
        }
        
        setCustomerErrors(newErrors);
        return;
      }

      if (response.success && response.data) {
        // Check if OTP verification is required (no token means OTP verification needed)
        const needsOTPVerification = !response.data.token || 
          response.data.user.status === "pending_email" || 
          response.data.user.status === "pending_phone";
        
        if (needsOTPVerification) {
          // OTP verification required - store profile image in sessionStorage for upload after verification
          if (customerData.image) {
            try {
              // Convert file to base64 for storage (temporary, will be uploaded to S3 after OTP verification)
              const reader = new FileReader();
              reader.onload = () => {
                const base64Data = reader.result as string;
                sessionStorage.setItem('pendingProfileImage', base64Data);
                sessionStorage.setItem('pendingProfileImageName', customerData.image!.name);
                sessionStorage.setItem('pendingProfileImageType', customerData.image!.type);
              };
              reader.readAsDataURL(customerData.image);
            } catch (error) {
              console.error('Failed to store profile image for later upload:', error);
            }
          }
          
          // OTP verification required - redirect to OTP page
          toast.success("Account created! Please verify your email.");
          const email = encodeURIComponent(
            response.data.user.email || customerData.email
          );
          window.location.href = `/otp2?email=${email}`;
        } else {
          // Account already verified - store tokens and upload profile image if provided
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            if (response.data.refreshToken) {
              localStorage.setItem("refreshToken", response.data.refreshToken);
            }
            localStorage.setItem("user", JSON.stringify(response.data.user));
            
            // Upload profile image if provided
            if (customerData.image) {
              try {
                const { uploadFileToS3 } = await import('@/services/upload.api');
                const profileImageUrl = await uploadFileToS3(customerData.image, 'profiles');
                
                // Update user profile with the uploaded image URL
                const { userApi } = await import('@/services/user.api');
                await userApi.updateProfile({ profileImageUrl } as any);
                
                // Refresh user data
                const updatedUser = await userApi.getCurrentUser();
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                toast.success("Profile image uploaded successfully!");
              } catch (imageError: any) {
                console.error("Failed to upload profile image:", imageError);
                // Don't block registration if image upload fails
                toast.error("Profile image upload failed. You can upload it later in profile settings.");
              }
            }
            
            // Dispatch custom event to notify Header component of auth state change
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("authStateChanged"));
            }
          }
          
          toast.success("Account created successfully!");
          
          // Redirect based on role
          if (response.data.user.role === "vendor") {
            // Vendor should manage account in admin panel only.
            // Log out from website context before redirecting to admin.
            if (typeof window !== "undefined") {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              window.dispatchEvent(new Event("authStateChanged"));
            }

            // Vendor goes to admin panel login page (different domain)
            const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
            if (!baseUrl) {
              toast.error("Admin URL is not configured. Set NEXT_PUBLIC_ADMIN_URL in website .env.");
              return;
            }
            const email = encodeURIComponent(
              response.data.user.email || customerData.email
            );
            window.location.href = `${baseUrl}/login?email=${email}`;
          } else {
            // Customer stays on same domain - use window.location for immediate navigation
            window.location.href = "/";
          }
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Signup failed";
      
      // Map backend errors to specific fields
      const newErrors = { name: "", email: "", phone: "", password: "" };
      
      if (errorMessage.toLowerCase().includes("email already exists") || 
          errorMessage.toLowerCase().includes("user with this email")) {
        newErrors.email = "This email is already registered. Please use a different email or log in.";
      } else if (errorMessage.toLowerCase().includes("phone already exists") ||
                 errorMessage.toLowerCase().includes("user with this phone")) {
        newErrors.phone = "This phone number is already registered. Please use a different phone number.";
      } else if (errorMessage.toLowerCase().includes("email")) {
        newErrors.email = errorMessage;
      } else if (errorMessage.toLowerCase().includes("phone")) {
        newErrors.phone = errorMessage;
      } else if (errorMessage.toLowerCase().includes("password")) {
        newErrors.password = errorMessage;
      } else {
        // Show general error in toast if it's not field-specific
        toast.error(errorMessage);
      }
      
      setCustomerErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#efefef] flex items-center justify-center relative overflow-hidden py-10">
      <div
        className="absolute -top-10 bg-[#efefef] w-full h-full z-10 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
        }}
      />

      <div className="relative z-20 w-full max-w-md px-4">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#333333]">Create Account</h2>
            <p className="text-gray-500 mt-2">Join our marketplace today</p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "customer"
                  ? "bg-white text-[#ee8e31] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("customer")}
            >
              Customer
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "vendor"
                  ? "bg-white text-[#ee8e31] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("vendor")}
            >
              Vendor
            </button>
          </div>

          {activeTab === "customer" ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleCustomerChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                    customerErrors.name ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-orange-500 outline-none`}
                  placeholder="Your full name"
                />
                {customerErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{customerErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleCustomerChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                    customerErrors.email ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-orange-500 outline-none`}
                  placeholder="name@example.com"
                />
                {customerErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{customerErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleCustomerChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                    customerErrors.phone ? "border-red-500" : "border-gray-200"
                  } focus:ring-2 focus:ring-orange-500 outline-none`}
                  placeholder="+974..."
                />
                {customerErrors.phone && (
                  <p className="mt-1 text-sm text-red-500">{customerErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCustomerPassword ? "text" : "password"}
                    name="password"
                    value={customerData.password}
                    onChange={handleCustomerChange}
                    required
                    minLength={6}
                    className={`w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border ${
                      customerErrors.password ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-orange-500 outline-none`}
                    placeholder="Create a password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showCustomerPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {customerErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{customerErrors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                <div
                  onClick={() => customerImageInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    customerData.image
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:border-[#ee8e31] hover:bg-orange-50"
                  }`}
                >
                  <input
                    ref={customerImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleCustomerImageChange}
                    className="hidden"
                  />
                  
                  {customerData.image ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={URL.createObjectURL(customerData.image)}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomerImage();
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{customerData.image.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ee8e31] text-white font-semibold py-3 rounded-lg hover:bg-[#d67a1f] transition disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up as Customer"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Register as Vendor
                </h2>
                <p className="text-gray-600">
                  Complete your vendor registration to start selling on our platform
                </p>
              </div>
              <button
                onClick={() => {
                  // Use window.location for immediate navigation
                  window.location.href = '/build-vendor-account';
                }}
                className="flex items-center justify-center gap-3 bg-[#ee8e31] text-white font-semibold px-8 py-4 rounded-lg hover:bg-[#d67a1f] transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span>Register as Vendor</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ee8e31] font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
