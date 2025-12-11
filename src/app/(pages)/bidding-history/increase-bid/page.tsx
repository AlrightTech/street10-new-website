"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { auctionApi } from "@/services/auction.api";

export default function IncreaseBidPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get("id");
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(600);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const currentBid = 500; // This should come from auction data

  const presetAmounts = [600, 700, 800, 900];

  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const handleIncreaseBid = async () => {
    // Check if user is verified
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.customerType !== 'verified') {
            toast.error("Please verify your account first to place bids");
            router.push("/upload-cnic");
            return;
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      } else {
        toast.error("Please login to place bids");
        router.push("/login");
        return;
      }
    }

    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    if (!amount) {
      toast.error("Please select or enter an amount");
      return;
    }

    if (amount < 100) {
      toast.error("Amount must be 100 or more");
      return;
    }

    if (amount <= currentBid) {
      toast.error("New bid must be higher than current bid");
      return;
    }

    try {
      setLoading(true);
      if (auctionId) {
        // Convert to minor units (cents)
        const amountMinor = amount * 100;
        await auctionApi.placeBid(auctionId, { amountMinor });
        toast.success("Bid increased successfully");
        router.back();
      } else {
        toast.error("Auction ID not found");
      }
    } catch (error: any) {
      console.error("Error increasing bid:", error);
      const errorMessage = error?.response?.data?.message || error.message || "Failed to increase bid";
      if (errorMessage.includes("verified") || errorMessage.includes("verification")) {
        toast.error("Please verify your account first to place bids");
        router.push("/upload-cnic");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-3"
            aria-label="Go back"
          >
            <Image
              src="/images/street/back-vector.png"
              alt="Back"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4 md:px-6 pb-8 pt-16">
        {/* Current Bid */}
        <div className="bg-gray-100 rounded-lg px-4 py-3 mb-6 text-center">
          <p className="text-gray-700 font-medium">Current: {currentBid} QAR</p>
        </div>

        {/* Increase Amount Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-black mb-4">Increase amount</h2>
          <div className="grid grid-cols-4 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handlePresetSelect(amount)}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  selectedAmount === amount
                    ? "bg-[#EE8E32] text-white"
                    : amount === 800 && amount === presetAmounts[presetAmounts.length - 1]
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-orange-100 text-[#EE8E32] hover:bg-orange-200"
                }`}
                disabled={amount === 800 && amount === presetAmounts[presetAmounts.length - 1]}
              >
                {amount} QAR
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Or Increase custom amount (QAR)
          </h2>
          <input
            type="text"
            value={customAmount}
            onChange={handleCustomAmountChange}
            placeholder="Enter amount"
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 text-black placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-2">
            must be 100+ ex. 600, 700..100000
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleIncreaseBid}
            disabled={loading || (!selectedAmount && !customAmount)}
            className="w-full bg-[#EE8E32] hover:bg-[#d87a28] text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Increase Bid"}
          </button>
          <button
            onClick={handleCancel}
            className="w-full text-center text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

