"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authApi } from "@/services/auth.api";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"customer" | "vendor">("customer");
  const [loading, setLoading] = useState(false);
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showVendorPassword, setShowVendorPassword] = useState(false);
  
  // Customer Form State
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Vendor Form State
  const [vendorData, setVendorData] = useState({
    name: "", // Business Name
    email: "",
    phone: "",
    password: "",
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVendorData({ ...vendorData, [e.target.name]: e.target.value });
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.password) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        password: customerData.password,
        provider: "email",
      });

      if (response.success && response.data) {
        toast.success("Account created successfully!");
        // Store token and user data
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        // Redirect based on role
        if (response.data.user.role === "vendor") {
          // Vendor goes to admin panel (different domain)
          window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || "https://street10-admin.vercel.app/dashboard";
        } else {
          // Customer stays on same domain - use router
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorData.email || !vendorData.password || !vendorData.name || !vendorData.phone) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.registerVendor({
        name: vendorData.name,
        email: vendorData.email,
        phone: vendorData.phone,
        password: vendorData.password,
        provider: "email",
      });

      if (response.success && response.data) {
        toast.success("Vendor account created successfully!");
        // Store token and user data
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        // Redirect vendor to admin dashboard (different domain)
        window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || "https://street10-admin.vercel.app/dashboard";
      }
    } catch (error: any) {
      console.error("Vendor signup error:", error);
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute -top-10 bg-[#efefef] w-full h-full z-10">
        <Image
          src="/images/street/build-your-account.png"
          alt="background"
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleCustomerChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleCustomerChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleCustomerChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="+974..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showCustomerPassword ? "text" : "password"}
                    name="password"
                    value={customerData.password}
                    onChange={handleCustomerChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Create a password"
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
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              // Save vendor data to localStorage for pre-filling on next page
              localStorage.setItem('vendorSignupData', JSON.stringify({
                businessName: vendorData.name,
                email: vendorData.email,
                phone: vendorData.phone,
                password: vendorData.password
              }));
              router.push('/build-vendor-account'); 
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  name="name"
                  value={vendorData.name}
                  onChange={handleVendorChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Your Business Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={vendorData.email}
                  onChange={handleVendorChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="business@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={vendorData.phone}
                  onChange={handleVendorChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="+974..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showVendorPassword ? "text" : "password"}
                    name="password"
                    value={vendorData.password}
                    onChange={handleVendorChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVendorPassword(!showVendorPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showVendorPassword ? (
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
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ee8e31] text-white font-semibold py-3 rounded-lg hover:bg-[#d67a1f] transition disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up as Vendor"}
              </button>
            </form>
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
