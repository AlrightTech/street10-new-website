"use client";
import React from "react";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprovalModal({ isOpen, onClose }: ApprovalModalProps) {
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
          {/* Modal Content */}
          <div className="p-8 text-center">
            {/* Emoji Icon */}
            <div className="flex justify-center mb-6">
              <div className="text-6xl">😐</div>
            </div>

            {/* Main Message */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Please Wait For Admin Approval
            </h2>

            {/* Ok Button */}
            <button
              onClick={onClose}
              className="w-full bg-[#EE8E32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

