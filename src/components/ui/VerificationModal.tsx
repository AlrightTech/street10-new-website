"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IoShieldCheckmark } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition"
            aria-label="Close modal"
          >
            <IoClose size={20} className="text-gray-600" />
          </button>

          {/* Modal Content */}
          <div className="p-8 text-center">
            {/* Shield Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#6B46C1] rounded-full flex items-center justify-center">
                <IoShieldCheckmark size={40} className="text-white" />
              </div>
            </div>

            {/* Main Message */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Please Verify Your Account First
            </h2>

            {/* Get Verified Button */}
            <button
              onClick={() => {
                onClose();
                router.push("/upload-cnic");
              }}
              className="w-full bg-gradient-to-r from-[#EE8E32] to-[#F2994A] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition mb-4"
            >
              Get Verified
            </button>

            {/* Helper Text */}
            <p className="text-sm text-gray-500">
              This helps keep our marketplace safe.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

