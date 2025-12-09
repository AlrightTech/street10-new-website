"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authApi } from "@/services/auth.api";
import Image from "next/image";

export default function BuildVendorAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const companyRegFileInputRef = useRef<HTMLInputElement>(null);
  const commercialLicenseFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    contactPerson: "",
    contactPersonPhone: "",
    email: "",
    companyPhone: "",
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
    // Password (needed for registration)
    password: "",
  });

  // Load pre-filled data from signup page
  useEffect(() => {
    const savedData = localStorage.getItem('vendorSignupData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          businessName: parsedData.businessName || prev.businessName,
          email: parsedData.email || prev.email,
          companyPhone: parsedData.phone || prev.companyPhone,
          password: parsedData.password || prev.password,
        }));
        // Clear the saved data after using it
        localStorage.removeItem('vendorSignupData');
      } catch (error) {
        console.error('Error parsing saved vendor data:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "companyRegistrationDoc" | "commercialLicense"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.contactPerson ||
      !formData.contactPersonPhone ||
      !formData.email ||
      !formData.companyPhone ||
      !formData.businessName ||
      !formData.businessAddress ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.country
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required. Please go back and set a password.");
      return;
    }

    if (!formData.companyRegistrationDoc || !formData.commercialLicense) {
      toast.error("Please upload both required documents");
      return;
    }

    try {
      setLoading(true);

      // Log the request in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting vendor registration:', {
          name: formData.businessName,
          email: formData.email,
          phone: formData.companyPhone,
        });
      }

      // Try to register vendor, but navigate regardless of API response
      try {
        const response = await authApi.registerVendor({
          name: formData.businessName,
          email: formData.email,
          phone: formData.companyPhone,
          password: formData.password,
          provider: "email",
        });

        if (response.success && response.data) {
          toast.success("Vendor account created successfully!");
          // Store token and user data
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        }
      } catch (apiError) {
        // Silently handle API errors - we'll navigate anyway
        console.log("API registration attempt completed (may have failed)");
      }

      // Always redirect to vendor dashboard (static navigation)
      const vendorDashboardUrl = process.env.NEXT_PUBLIC_VENDOR_DASHBOARD_URL || "https://street10-admin.vercel.app/dashboard";
      window.location.href = vendorDashboardUrl;
    } catch (error: any) {
      // This catch block should not be reached due to inner try-catch, but keep for safety
      console.error("Unexpected error:", error);
      
      // Still navigate to dashboard even on unexpected errors
      const vendorDashboardUrl = process.env.NEXT_PUBLIC_VENDOR_DASHBOARD_URL || "https://street10-admin.vercel.app/dashboard";
      window.location.href = vendorDashboardUrl;
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
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Your Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Contact Person's Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactPersonPhone"
                    value={formData.contactPersonPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Contact Person's Phone Number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Your Email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Phone Number
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Phone Number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Business Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-[#333333] mb-6">Business Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Your Business Name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Business Address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter City Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Zip Code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#ee8e31] focus:border-transparent outline-none transition"
                    placeholder="Enter Country"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Sections */}
            <div className="space-y-4">
              {/* Company Registration Doc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Company registration Doc
                </label>
                <div
                  onClick={() => companyRegFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#ee8e31] transition-colors bg-gray-50"
                >
                  <input
                    ref={companyRegFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "companyRegistrationDoc")}
                    className="hidden"
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
              </div>

              {/* Commercial License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Commercial license
                </label>
                <div
                  onClick={() => commercialLicenseFileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#ee8e31] transition-colors bg-gray-50"
                >
                  <input
                    ref={commercialLicenseFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "commercialLicense")}
                    className="hidden"
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

