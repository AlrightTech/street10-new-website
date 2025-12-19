"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { IoShieldCheckmark } from "react-icons/io5";
import { IoClose } from "react-icons/io5";

type VerificationContext = "bidding" | "ecommerce";
type VerificationState = "guest" | "need_verification" | "pending";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Where the modal is shown from – bidding or ecommerce.
   * Controls copy so the message feels correct for the action.
   */
  context?: VerificationContext;
  /**
   * What we want the user to do.
   * - guest: not logged in, needs to register (and maybe verify later)
   * - need_verification: logged in but not yet submitted KYC
   * - pending: KYC submitted and waiting for approval
   */
  state?: VerificationState;
}

export default function VerificationModal({
  isOpen,
  onClose,
  context = "bidding",
  state = "need_verification",
}: VerificationModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  // Decide title, description and buttons based on context + state
  let title = "";
  let description = "";
  let primaryLabel: string | null = null;
  let primaryAction: (() => void) | null = null;

  if (state === "guest") {
    // Not logged in
    if (context === "ecommerce") {
      title = "Please register to continue";
      description = "Create an account to buy products on Street 10.";
    } else {
      // bidding
      title = "Register and verify to place bids";
      description = "First register your account, then verify your identity to start bidding.";
    }
    primaryLabel = "Register";
    primaryAction = () => {
      onClose();
      router.push("/signup");
    };
  } else if (state === "pending") {
    // KYC already submitted
    title = "Verification is in progress";
    description =
      "Your documents have been submitted and are under review. You will be able to bid as soon as your verification is approved.";
    primaryLabel = null; // Just show Close
  } else {
    // need_verification
    title = "Please verify your account first";
    description = "Verify your account once to securely place bids on Street 10.";
    primaryLabel = "Get Verified";
    primaryAction = () => {
      onClose();
      router.push("/upload-cnic");
    };
  }

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
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {title}
            </h2>

            {/* Helper Text */}
            <p className="text-sm text-gray-600 mb-6">{description}</p>

            {/* Primary Action (if any) */}
            {primaryLabel && primaryAction && (
              <button
                onClick={primaryAction}
                className="w-full bg-gradient-to-r from-[#EE8E32] to-[#F2994A] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition mb-3"
              >
                {primaryLabel}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

