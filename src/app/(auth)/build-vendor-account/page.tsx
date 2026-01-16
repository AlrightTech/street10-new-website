"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authApi } from "@/services/auth.api";
import Image from "next/image";

export default function BuildVendorAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const companyRegFileInputRef = useRef<HTMLInputElement>(null);
  const commercialLicenseFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    contactPerson: "",
    contactPersonPhone: "",
    email: "",
    companyPhone: "",
    password: "",
    // Business Details
    businessName: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    // Documents
    companyRegistrationDoc: null as File | null,
    commercialLicense: null as File | null,
    image: null as File | null,
  });

  // Form Errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    contactPerson: "",
    contactPersonPhone: "",
    email: "",
    companyPhone: "",
    password: "",
    businessName: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    companyRegistrationDoc: "",
    commercialLicense: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "companyRegistrationDoc" | "commercialLicense" | "image"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  // Helper function to validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || !phone.trim()) return false;
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    // Phone should have 10-15 digits
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFormErrors({
      name: "",
      contactPerson: "",
      contactPersonPhone: "",
      email: "",
      companyPhone: "",
      businessName: "",
      businessAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      password: "",
      companyRegistrationDoc: "",
      commercialLicense: "",
    });

    // Validate required fields with specific error messages
    let hasErrors = false;
    const newErrors = {
      name: "",
      contactPerson: "",
      contactPersonPhone: "",
      email: "",
      companyPhone: "",
      businessName: "",
      businessAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      password: "",
      companyRegistrationDoc: "",
      commercialLicense: "",
    };

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
      hasErrors = true;
    }
    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = "Contact person name is required";
      hasErrors = true;
    }
    if (!formData.contactPersonPhone?.trim()) {
      newErrors.contactPersonPhone = "Contact person phone number is required";
      hasErrors = true;
    } else if (!validatePhoneNumber(formData.contactPersonPhone)) {
      newErrors.contactPersonPhone = "Please enter a valid phone number (10-15 digits)";
      hasErrors = true;
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }
    if (!formData.companyPhone?.trim()) {
      newErrors.companyPhone = "Company phone number is required";
      hasErrors = true;
    } else if (!validatePhoneNumber(formData.companyPhone)) {
      newErrors.companyPhone = "Please enter a valid phone number (10-15 digits)";
      hasErrors = true;
    }
    if (!formData.businessName?.trim()) {
      newErrors.businessName = "Business name is required";
      hasErrors = true;
    }
    if (!formData.businessAddress?.trim()) {
      newErrors.businessAddress = "Business address is required";
      hasErrors = true;
    }
    if (!formData.city?.trim()) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!formData.state?.trim()) {
      newErrors.state = "State is required";
      hasErrors = true;
    }
    if (!formData.zipCode?.trim()) {
      newErrors.zipCode = "Zip code is required";
      hasErrors = true;
    }
    if (!formData.country?.trim()) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password is required and must be at least 6 characters";
      hasErrors = true;
    }
    if (!formData.companyRegistrationDoc) {
      newErrors.companyRegistrationDoc = "Company registration document is required";
      hasErrors = true;
    }
    if (!formData.commercialLicense) {
      newErrors.commercialLicense = "Commercial license document is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Convert files to base64
      // These are guaranteed to be non-null due to validation above
      const companyRegDocBase64 = await fileToBase64(formData.companyRegistrationDoc!);
      const commercialLicenseBase64 = await fileToBase64(formData.commercialLicense!);
      const profileImageBase64 = formData.image ? await fileToBase64(formData.image) : null;

      // Prepare companyDocs object with document URLs (base64 for now)
      const companyDocs = {
        companyRegistrationDoc: {
          url: companyRegDocBase64,
          name: formData.companyRegistrationDoc!.name,
          type: formData.companyRegistrationDoc!.type,
        },
        commercialLicense: {
          url: commercialLicenseBase64,
          name: formData.commercialLicense!.name,
          type: formData.commercialLicense!.type,
        },
      };

      // Register vendor with all business details
      const response = await authApi.registerVendor({
        name: formData.businessName,
        email: formData.email,
        phone: formData.companyPhone,
        password: formData.password,
        provider: "email",
        // Business details
        contactPerson: formData.contactPerson,
        contactPersonPhone: formData.contactPersonPhone,
        businessAddress: formData.businessAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        ownerName: formData.name, // Store owner name in business details
        // Documents
        companyDocs: companyDocs,
        ownerIdUrl: null, // Can be added later if needed
        profileImageUrl: profileImageBase64,
      });

      // Check if response indicates an error
      if (response.success === false || !response.success) {
        const errorMessage = (response as any).error || "Vendor registration failed";
        
        // Map backend errors to specific fields
        const newErrors = {
          name: "",
          contactPerson: "",
          contactPersonPhone: "",
          email: "",
          companyPhone: "",
          businessName: "",
          businessAddress: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          password: "",
          companyRegistrationDoc: "",
          commercialLicense: "",
        };
        
        if (errorMessage.toLowerCase().includes("email already exists") || 
            errorMessage.toLowerCase().includes("user with this email")) {
          newErrors.email = "This email is already registered. Please use a different email or log in.";
        } else if (errorMessage.toLowerCase().includes("phone already exists") ||
                   errorMessage.toLowerCase().includes("user with this phone")) {
          newErrors.companyPhone = "This phone number is already registered. Please use a different phone number.";
        } else if (errorMessage.toLowerCase().includes("email")) {
          newErrors.email = errorMessage;
        } else if (errorMessage.toLowerCase().includes("phone")) {
          newErrors.companyPhone = errorMessage;
        } else if (errorMessage.toLowerCase().includes("password")) {
          newErrors.password = errorMessage;
        } else {
          // Show general error in toast if it's not field-specific
          toast.error(errorMessage);
        }
        
        setFormErrors(newErrors);
        return;
      }

      if (response.success && response.data) {
        // Check if OTP verification is required (no token means OTP verification needed)
        const needsOTPVerification = !response.data.token || 
          response.data.user.status === "pending_email" || 
          response.data.user.status === "pending_phone";
        
        if (needsOTPVerification) {
          // OTP verification required - redirect to OTP page
          toast.success("Vendor account created! Please verify your email.");
          const email = encodeURIComponent(
            response.data.user.email || formData.email
          );
          window.location.href = `/otp2?email=${email}`;
        } else {
          // Account already verified - store tokens and redirect
          toast.success("Vendor account created successfully!");
          // Store token, refresh token, and user data (website context)
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            if (response.data.refreshToken) {
              localStorage.setItem("refreshToken", response.data.refreshToken);
            }
            localStorage.setItem("user", JSON.stringify(response.data.user));
            
            // Dispatch custom event to notify Header component of auth state change
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("authStateChanged"));
            }
          }

          // Before moving vendor to admin panel, log them out from website
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("authStateChanged"));
          }

          // Redirect to vendor admin login page
          const baseUrl =
            process.env.NEXT_PUBLIC_ADMIN_URL || "https://street10-admin.vercel.app";
          const email = encodeURIComponent(
            response.data.user.email || formData.email
          );
          window.location.href = `${baseUrl}/login?email=${email}`;
        }
      }
    } catch (error: any) {
      console.error("Vendor registration error:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Vendor registration failed";
      
      // Map backend errors to specific fields
      const newErrors = {
        name: "",
        contactPerson: "",
        contactPersonPhone: "",
        email: "",
        companyPhone: "",
        businessName: "",
        businessAddress: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        password: "",
        companyRegistrationDoc: "",
        commercialLicense: "",
      };
      
      if (errorMessage.toLowerCase().includes("email already exists") || 
          errorMessage.toLowerCase().includes("user with this email")) {
        newErrors.email = "This email is already registered. Please use a different email or log in.";
      } else if (errorMessage.toLowerCase().includes("phone already exists") ||
                 errorMessage.toLowerCase().includes("user with this phone")) {
        newErrors.companyPhone = "This phone number is already registered. Please use a different phone number.";
      } else if (errorMessage.toLowerCase().includes("email")) {
        newErrors.email = errorMessage;
      } else if (errorMessage.toLowerCase().includes("phone")) {
        newErrors.companyPhone = errorMessage;
      } else if (errorMessage.toLowerCase().includes("password")) {
        newErrors.password = errorMessage;
      } else {
        // Show general error in toast if it's not field-specific
        toast.error(errorMessage);
      }
      
      setFormErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] relative overflow-hidden py-10">
      {/* Background Pattern */}
      <div className="absolute -top-10 bg-[#efefef] w-full h-full z-10">
        <Image
          src="/images/street/build-your-account.png"
          alt="background"
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 lg:p-10">
          {/* Back Arrow */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {/* Title and Subtitle */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-2">
              Let's build your account
            </h1>
            <p className="text-gray-500 text-base md:text-lg">
              Provide some info to complete your account info
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-[#333333] mb-6">Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.name ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Your Name"
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.contactPerson ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Contact Person's Name"
                    required
                  />
                  {formErrors.contactPerson && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.contactPerson}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.contactPersonPhone ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Contact Person's Phone Number"
                    required
                  />
                  {formErrors.contactPersonPhone && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.contactPersonPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.email ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Your Email"
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.companyPhone ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Phone Number"
                    required
                  />
                  {formErrors.companyPhone && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.companyPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border ${
                        formErrors.password ? "border-red-500" : "border-gray-200"
                      } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                      placeholder="Create a password (min 6 characters)"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
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
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-[#333333] mb-6">Business Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.businessName ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Your Business Name"
                    required
                  />
                  {formErrors.businessName && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.businessName}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.businessAddress ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Business Address"
                    required
                  />
                  {formErrors.businessAddress && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.businessAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.city ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter City Name"
                    required
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.state ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter State"
                    required
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.zipCode ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Zip Code"
                    required
                  />
                  {formErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.zipCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${
                      formErrors.country ? "border-red-500" : "border-gray-200"
                    } focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition`}
                    placeholder="Enter Country"
                    required
                  />
                  {formErrors.country && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Document Upload Sections */}
            <div className="space-y-4">
              {/* Company Registration Doc */}
              <div>
                <label htmlFor="companyRegDoc" className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Company registration Doc <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => companyRegFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    formErrors.companyRegistrationDoc
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50 hover:border-[#ee8e31]"
                  }`}
                >
                  <input
                    id="companyRegDoc"
                    ref={companyRegFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      handleFileChange(e, "companyRegistrationDoc");
                      if (formErrors.companyRegistrationDoc) {
                        setFormErrors({ ...formErrors, companyRegistrationDoc: "" });
                      }
                    }}
                    className="hidden"
                    aria-label="Upload Company registration Doc"
                  />
                  <div className="flex flex-col items-center justify-center">
                    {/* Cloud Upload Icon */}
                    <svg
                      className="w-12 h-12 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      {formData.companyRegistrationDoc
                        ? formData.companyRegistrationDoc.name
                        : "Upload Company registration Doc"}
                    </p>
                  </div>
                </div>
                {formErrors.companyRegistrationDoc && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.companyRegistrationDoc}</p>
                )}
              </div>

              {/* Commercial License */}
              <div>
                <label htmlFor="commercialLicense" className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Commercial license <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => commercialLicenseFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    formErrors.commercialLicense
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50 hover:border-[#ee8e31]"
                  }`}
                >
                  <input
                    id="commercialLicense"
                    ref={commercialLicenseFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      handleFileChange(e, "commercialLicense");
                      if (formErrors.commercialLicense) {
                        setFormErrors({ ...formErrors, commercialLicense: "" });
                      }
                    }}
                    className="hidden"
                    aria-label="Upload Commercial license"
                  />
                  <div className="flex flex-col items-center justify-center">
                    {/* Cloud Upload Icon */}
                    <svg
                      className="w-12 h-12 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      {formData.commercialLicense
                        ? formData.commercialLicense.name
                        : "Upload Commercial license"}
                    </p>
                  </div>
                </div>
                {formErrors.commercialLicense && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.commercialLicense}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Profile Image
                </label>
                <div
                  onClick={() => imageFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#ee8e31] transition-colors bg-gray-50"
                >
                  <input
                    id="imageUpload"
                    ref={imageFileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="hidden"
                    aria-label="Upload Profile Image"
                  />
                  <div className="flex flex-col items-center justify-center">
                    {/* Cloud Upload Icon */}
                    <svg
                      className="w-12 h-12 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600 font-medium">
                      {formData.image
                        ? formData.image.name
                        : "Upload Profile Image"}
                    </p>
                    {formData.image && (
                      <div className="mt-4">
                        <img
                          src={URL.createObjectURL(formData.image)}
                          alt="Preview"
                          className="max-w-full max-h-48 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ee8e31] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#d67a1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Vander Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

