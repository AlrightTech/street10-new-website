"use client";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiUpload, FiX } from "react-icons/fi";
import ApprovalModal from "@/components/ui/ApprovalModal";

export default function UploadCNICPage() {
  const router = useRouter();
  const frontSideInputRef = useRef<HTMLInputElement>(null);
  const backSideInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [frontSideFile, setFrontSideFile] = useState<File | null>(null);
  const [backSideFile, setBackSideFile] = useState<File | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
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

      if (side === "front") {
        setFrontSideFile(file);
      } else {
        setBackSideFile(file);
      }
    }
  };

  const removeFile = (side: "front" | "back") => {
    if (side === "front") {
      setFrontSideFile(null);
      if (frontSideInputRef.current) {
        frontSideInputRef.current.value = "";
      }
    } else {
      setBackSideFile(null);
      if (backSideInputRef.current) {
        backSideInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!frontSideFile || !backSideFile) {
      toast.error("Please upload both front and back sides of your CNIC");
      return;
    }

    try {
      setLoading(true);
      
      // Convert files to base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const frontSideBase64 = await fileToBase64(frontSideFile);
      const backSideBase64 = await fileToBase64(backSideFile);

      // Submit KYC documents
      const { kycApi } = await import("@/services/kyc.api");
      const result = await kycApi.submitKYC([frontSideBase64, backSideBase64]);
      
      // Update user data in localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.customerType = 'verification_pending';
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Error updating user data:", error);
        }
      }
      
      toast.success("CNIC documents submitted successfully! Verification pending.");
      
      // Show approval modal instead of redirecting
      setIsApprovalModalOpen(true);
    } catch (error: any) {
      console.error("Error uploading CNIC:", error);
      toast.error(error.message || "Failed to upload CNIC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden py-6">
      {/* Background decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 right-0 w-3/4 h-64 bg-gray-200 rounded-bl-[50%] opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-2/3 h-48 bg-blue-100 rounded-tr-[50%] opacity-30"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50 px-4 md:px-6 pt-6 pb-4">
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-2xl w-full px-4 md:px-6 py-6 mt-16">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Upload Your CNIC
            </h1>
            <p className="text-gray-600">
              Verify your identity to continue bidding
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload CNIC Front Side */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Upload CNIC Front Side
              </h2>
              <div
                onClick={() => frontSideInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  frontSideFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#EE8E32] hover:bg-orange-50"
                }`}
              >
                <input
                  ref={frontSideInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleFileChange(e, "front")}
                  className="hidden"
                />
                
                {frontSideFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FiUpload className="text-green-600" size={24} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {frontSideFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(frontSideFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile("front");
                        }}
                        className="p-1 hover:bg-red-100 rounded-full transition"
                      >
                        <FiX className="text-red-600" size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FiUpload className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      (Drag & drop or click to upload)
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload CNIC Back Side */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Upload CNIC Back Side
              </h2>
              <div
                onClick={() => backSideInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  backSideFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-[#EE8E32] hover:bg-orange-50"
                }`}
              >
                <input
                  ref={backSideInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleFileChange(e, "back")}
                  className="hidden"
                />
                
                {backSideFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FiUpload className="text-green-600" size={24} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {backSideFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(backSideFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile("back");
                        }}
                        className="p-1 hover:bg-red-100 rounded-full transition"
                      >
                        <FiX className="text-red-600" size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FiUpload className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      (Drag & drop or click to upload)
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG</p>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> Your information is securely stored and only used for verification.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !frontSideFile || !backSideFile}
                className="px-6 py-3 bg-[#EE8E32] text-white rounded-lg font-medium hover:bg-[#d87a28] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          router.push("/profile");
        }}
      />
    </div>
  );
}

