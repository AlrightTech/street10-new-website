"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { settingsApi } from "@/services/settings.api";
import { userApi } from "@/services/user.api";
import { useRouter } from "next/navigation";

interface WinnerSettlement {
  orderId: string;
  orderNumber: string;
  auctionId: string;
  productTitle: string;
  productImageUrl: string | null;
  paymentStage: string;
  settlementDueAt: string;
  downPaymentMinor: string;
  remainingPaymentMinor: string;
  totalMinor: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
  };
}

const TopHeader = () => {
  const [logoUrl, setLogoUrl] = useState<string>("/icons/logo.svg");
  const [winnerSettlement, setWinnerSettlement] = useState<WinnerSettlement | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; expired: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await settingsApi.getPublicSettings();
        if (settings?.logos?.websiteLogo) {
          setLogoUrl(settings.logos.websiteLogo);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };

    const fetchWinnerSettlement = async () => {
      try {
        const response = await userApi.getAuctionWinner();
        if (response.success && response.data.winnerSettlement) {
          setWinnerSettlement(response.data.winnerSettlement);
          setTimeRemaining(response.data.winnerSettlement.timeRemaining);
        }
      } catch (error) {
        // User might not be logged in or no active settlement
        console.debug("No active winner settlement:", error);
      }
    };

    fetchLogo();
    fetchWinnerSettlement();

    // Only poll if we have an active settlement
    // Poll every 5 minutes (reduced from 1 minute) to reduce server load
    const interval = setInterval(() => {
      fetchWinnerSettlement();
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []); // Only run once on mount, don't depend on winnerSettlement

  const handleProceedToPayment = () => {
    if (winnerSettlement) {
      router.push(`/address?orderId=${winnerSettlement.orderId}`);
    }
  };

  // Don't render if no active winner settlement
  if (!winnerSettlement || winnerSettlement.timeRemaining.expired) {
    return null;
  }

  const formatTimeRemaining = () => {
    if (!timeRemaining) return "0d : 0h : 0m";
    const { days, hours, minutes } = timeRemaining;
    return `${days}d : ${hours}h : ${minutes}m`;
  };

  return (
    <header className="bg-[#4C50A2] text-white h-16 w-full flex items-center px-4 md:px-6">
      {/* Logo - Left */}
      <div className="flex-shrink-0">
        <Image 
          src={logoUrl} 
          alt="Logo" 
          width={40} 
          height={40}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/icons/logo.svg";
          }}
        />
      </div>

      {/* Center Content */}
      <div className="flex-1 flex justify-center">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs sm:text-sm md:text-base text-center md:text-left">
          <p className="flex items-center gap-2">
            <Image
              src="/icons/solar_cup-outline.svg"
              alt="Cup"
              width={18}
              height={18}
            />
            Congrats, you&apos;ve claimed the auction
          </p>
          <p className="flex gap-3 items-center cursor-pointer" onClick={handleProceedToPayment}>
            Kindly submit {(() => {
              if (winnerSettlement.paymentStage === 'down_payment_required') {
                return 'down payment';
              } else if (winnerSettlement.paymentStage === 'final_payment_required') {
                return 'final payment';
              } else if (winnerSettlement.paymentStage === 'full_payment_required') {
                return 'full payment';
              }
              return 'payment';
            })()} or go to the office in {formatTimeRemaining()} for your item{" "}
            <IoIosArrowRoundForward size={30} />
          </p>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
