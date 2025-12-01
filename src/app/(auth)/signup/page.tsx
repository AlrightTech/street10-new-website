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
    if (!customerData.name || !customerData.email || !customerData.password) {
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

      if (response.success) {
        toast.success("Account created! Please verify your email.");
        router.push(`/otp2?email=${encodeURIComponent(customerData.email)}`);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const msg = error?.response?.data?.message || "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorData.email || !vendorData.password || !vendorData.name) {
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

      if (response.success) {
        toast.success("Vendor account created! Please verify your email.");
        router.push(`/otp2?email=${encodeURIComponent(vendorData.email)}`);
      }
    } catch (error: any) {
      console.error("Vendor signup error:", error);
      const msg = error?.response?.data?.message || "Signup failed";
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleCustomerChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="+974..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={customerData.password}
                  onChange={handleCustomerChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Create a password"
                />
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
            <form onSubmit={handleVendorSubmit} className="space-y-4">
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
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="+974..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={vendorData.password}
                  onChange={handleVendorChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Create a password"
                />
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
