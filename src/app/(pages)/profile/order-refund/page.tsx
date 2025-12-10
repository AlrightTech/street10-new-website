"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiUpload } from "react-icons/fi";

export default function OrderRefundPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    transactionId: "",
    refundAmount: "",
    reason: "",
    description: "",
    attachment: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, attachment: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.orderId || !formData.refundAmount || !formData.reason || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await refundApi.createOrderRefund(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Refund request submitted successfully!");
      router.push("/profile");
    } catch (error: any) {
      console.error("Error submitting refund request:", error);
      toast.error(error.message || "Failed to submit refund request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const refundReasons = [
    "Product not received",
    "Product damaged/defective",
    "Wrong product received",
    "Order cancelled",
    "Payment issue",
    "Other",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50 px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-3 cursor-pointer relative z-50"
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
          <h1 className="text-2xl font-bold text-black mb-6">Order Refund Request</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl w-full px-4 md:px-6 py-6 mt-32">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition"
                placeholder="Enter Order ID (e.g., TX-1001)"
                required
              />
            </div>

            {/* Transaction ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition"
                placeholder="Enter Transaction ID if available"
              />
            </div>

            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount (QAR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="refundAmount"
                value={formData.refundAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition"
                placeholder="0.00"
                required
              />
            </div>

            {/* Reason for Refund */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition"
                required
              >
                <option value="">Select a reason</option>
                {refundReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition resize-none"
                placeholder="Please provide detailed information about your refund request..."
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Provide as much detail as possible to help us process your request faster.
              </p>
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Supporting Documents <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#EE8E32] transition-colors bg-gray-50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center">
                  <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-gray-600 font-medium">
                    {formData.attachment
                      ? formData.attachment.name
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Refund requests are typically processed within 5-7 business days. 
                You will receive an email notification once your request has been reviewed.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#EE8E32] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#d87a28] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
