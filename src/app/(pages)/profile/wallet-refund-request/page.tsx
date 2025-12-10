"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiEdit, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiOutlinePaperAirplane } from "react-icons/hi";

export default function WalletRefundRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableBalance] = useState("230.00");
  const [formData, setFormData] = useState({
    refundAmount: "",
    bankName: "",
    iban: "",
    accountNumber: "",
    country: "",
    swiftCode: "",
    saveDetails: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRequestFullBalance = () => {
    setFormData({ ...formData, refundAmount: availableBalance });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.refundAmount || parseFloat(formData.refundAmount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (parseFloat(formData.refundAmount) > parseFloat(availableBalance)) {
      toast.error("Refund amount cannot exceed available balance");
      return;
    }

    if (!formData.bankName || !formData.iban || !formData.accountNumber || !formData.country || !formData.swiftCode) {
      toast.error("Please fill in all bank details");
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Wallet refund request submitted successfully!");
      router.push("/profile");
    } catch (error: any) {
      console.error("Error submitting wallet refund request:", error);
      toast.error(error.message || "Failed to submit refund request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Qatar",
    "UAE",
    "Saudi Arabia",
    "Pakistan",
    "India",
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden py-6">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill className="opacity-5" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50 px-4 md:px-6 pt-6 pb-4 flex justify-between items-start">
        <button
          onClick={() => router.back()}
          className="p-1 hover:opacity-80 transition cursor-pointer relative z-50"
          aria-label="Go back"
          type="button"
        >
          <Image
            src="/images/street/back-vector.png"
            alt="Back"
            width={24}
            height={24}
            className="object-contain pointer-events-none"
          />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiClock size={16} />
          <span>Processing time: 3-5 business days</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl w-full px-4 md:px-6 py-6 mt-20">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet Refund Request</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Balance Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">$</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Balance</h2>
            <p className="text-3xl font-bold text-blue-900 mb-3">${availableBalance}</p>
            <p className="text-sm text-gray-600">
              You can request a partial or full refund of your wallet balance. The refund will be processed manually via bank transfer.
            </p>
          </div>

          {/* Refund Request Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Request</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Refund
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="refundAmount"
                      value={formData.refundAmount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max={availableBalance}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestFullBalance}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap"
                  >
                    Request Full Balance
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                <FiAlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-orange-800">
                  Requested amount will be frozen until the refund is processed or cancelled.
                </p>
              </div>
            </div>
          </div>

          {/* Bank Details Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Bank Details for Wire Transfer</h2>
              <button
                type="button"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <FiEdit size={16} />
                Edit Bank Details
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Please add or confirm your bank information. Refund will be sent to this account.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                    placeholder="Enter bank name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                    placeholder="Enter IBAN"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                    placeholder="Enter account number"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-10 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none appearance-none"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <MdKeyboardArrowDown 
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" 
                      size={24} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SWIFT Code
                  </label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                    placeholder="Enter SWIFT code"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="saveDetails"
                  checked={formData.saveDetails}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#EE8E32] border-gray-300 rounded focus:ring-[#EE8E32]"
                />
                <span className="text-sm text-gray-700">Save these details for future refunds</span>
              </label>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmation</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Refund Amount:</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${formData.refundAmount || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bank Account:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formData.accountNumber ? `****${formData.accountNumber.slice(-4)} (${formData.bankName || "Bank"})` : "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processing Time:</span>
                <span className="text-sm font-semibold text-gray-900">3-5 business days</span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <FiCheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-blue-800">
                Once submitted, the requested amount will be frozen until the admin processes your refund. 
                You can cancel your request before it's approved.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#EE8E32] text-white rounded-lg font-medium hover:bg-[#d87a28] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Submitting..." : (
                <>
                  Confirm & Submit Request
                  <HiOutlinePaperAirplane size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

