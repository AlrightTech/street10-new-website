"use client";
import Image from "next/image";
import React, { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiUpload, FiFileText, FiDollarSign, FiCamera } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

function RequestMoreInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: "",
    requestedAmount: "",
    reason: "",
    description: "",
    files: [] as File[],
  });

  const [orderDetails, setOrderDetails] = useState({
    orderDate: "Oct 15, 2024",
    orderAmount: "$89.99",
    paymentMethod: "Credit Card ****1234",
  });

  const refundReasons = [
    "Product not received",
    "Product damaged/defective",
    "Wrong product received",
    "Order cancelled",
    "Payment issue",
    "Other",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If order ID changes, fetch order details (mock)
    if (name === "orderId" && value) {
      // Mock order details fetch
      setOrderDetails({
        orderDate: "Oct 15, 2024",
        orderAmount: "$89.99",
        paymentMethod: "Credit Card ****1234",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, files: [...formData.files, ...files] });
  };

  const removeFile = (index: number) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderId || !formData.requestedAmount || !formData.reason || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
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

  const handleSaveDraft = () => {
    // Save form data to localStorage or state
    toast.success("Draft saved successfully!");
  };

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
        <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition">
          Help Center
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl w-full px-4 md:px-6 py-6 mt-20">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Order Refund</h1>
          <p className="text-gray-600">
            Fill out the form below to submit a refund request for your order.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Order Section */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiFileText className="text-gray-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Select Order</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Choose the order you want to request a refund for
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <select
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none appearance-none"
                    required
                  >
                    <option value="">Select an order...</option>
                    <option value="ORD-2024-789">ORD-2024-789</option>
                    <option value="ORD-2024-790">ORD-2024-790</option>
                    <option value="ORD-2024-791">ORD-2024-791</option>
                  </select>
                  <MdKeyboardArrowDown 
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" 
                    size={24} 
                  />
                </div>
              </div>
              
              {formData.orderId && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="text-gray-900 font-medium">{orderDetails.orderDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Amount:</span>
                      <span className="text-gray-900 font-medium">{orderDetails.orderAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-900 font-medium">{orderDetails.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Refund Details Section */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiDollarSign className="text-gray-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Refund Details</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Specify the refund amount and reason
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="requestedAmount"
                    value={formData.requestedAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max={orderDetails.orderAmount.replace("$", "")}
                    className="w-full pl-8 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                    placeholder="89.99"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum refund amount: {orderDetails.orderAmount}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Refund
                </label>
                <div className="relative">
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none appearance-none"
                    required
                  >
                    <option value="">Select a reason...</option>
                    {refundReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
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
                  Description / Additional Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none resize-none"
                  placeholder="Please provide detailed information about the issue..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Upload Evidence Section */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiCamera className="text-gray-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Upload Evidence</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Upload photos or documents to support your refund request (optional)
            </p>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-[#EE8E32] transition-colors bg-white"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center">
                <FiUpload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium mb-1">
                  Click to upload files or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, PDF up to 10MB each
                </p>
              </div>
            </div>

            {/* Uploaded Files List */}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review and Submit Section */}
          <div className="bg-gray-100 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review and Submit</h2>
            <p className="text-sm text-gray-600 mb-6">
              Please review your refund request before submitting
            </p>
            
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#EE8E32] text-white rounded-lg font-medium hover:bg-[#d87a28] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Refund Request"}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h3>
              <p className="text-sm text-blue-800">
                Your refund request will be reviewed by our team within 2-3 business days. 
                You'll receive an email confirmation and updates on the status of your request.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RequestMoreInfoPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <RequestMoreInfoPage />
    </Suspense>
  );
}

