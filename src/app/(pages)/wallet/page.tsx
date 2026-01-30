"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { walletApi, type WalletBalance } from "@/services/wallet.api";

const WalletPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const data = await walletApi.getBalance();
      setBalance(data);
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error);
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to load wallet balance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountQar = parseFloat(depositAmount);

    if (isNaN(amountQar) || amountQar <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const response = await walletApi.deposit(amountQar);
      if (response.success) {
        toast.success(
          response.message || `Successfully added ${amountQar.toFixed(2)} QAR to your wallet`
        );
        setDepositAmount("");
        await loadBalance();
      } else {
        toast.error(response.message || "Failed to add funds to wallet");
      }
    } catch (error: any) {
      console.error("Error depositing to wallet:", error);
      toast.error(
        error?.response?.data?.error?.message ||
          error?.message ||
          "Failed to add funds to wallet"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatMinor = (minor?: string) => {
    if (!minor) return "0.00";
    const num = parseFloat(minor);
    if (isNaN(num)) return "0.00";
    return (num / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden py-6">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image
          src="/images/street/profile.png"
          alt="background"
          fill
          className="opacity-5"
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50 px-4 md:px-6 pt-6 pb-4">
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
        <h1 className="text-2xl font-bold text-black">Wallet</h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl w-full px-4 md:px-6 pt-24 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Balance Card */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Current Balance
            </h2>
            {loading || !balance ? (
              <div className="h-16 flex items-center">
                <span className="text-gray-500 text-sm">Loading balance...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="text-xl font-bold text-[#EE8E32]">
                    QAR {formatMinor(balance.availableMinor)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                  <span>On Hold (deposits)</span>
                  <span>QAR {formatMinor(balance.onHoldMinor)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Locked (active bids)</span>
                  <span>QAR {formatMinor(balance.lockedMinor)}</span>
                </div>
              </>
            )}
          </div>

          {/* Add Funds Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Add Funds to Wallet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add money to your wallet to place bids and complete purchases.
              (In production, this will be connected to Stripe.)
            </p>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (QAR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    QAR
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#EE8E32] text-white py-3 rounded-lg font-semibold hover:bg-[#d87a28] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? "Adding funds..." : "Add Funds"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;

