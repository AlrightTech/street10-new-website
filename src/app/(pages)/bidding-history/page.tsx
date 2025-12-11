"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auctionApi } from "@/services/auction.api";
import type { Auction } from "@/services/auction.api";

interface BidHistoryItem {
  id: string;
  carImage: string;
  carMake: string;
  yourBid: number;
  highestBid: number;
  auctionEnd: string;
}

export default function BiddingHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bidding" | "order">("bidding");
  const [bids, setBids] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBiddingHistory = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to get user's bidding history
        // const response = await auctionApi.getUserBids();
        // setBids(response.data || []);
        
        // Temporary mock data
        setBids([
          {
            id: "1",
            carImage: "/images/cars/car-1.jpg",
            carMake: "BMW",
            yourBid: 1200000,
            highestBid: 1250000,
            auctionEnd: "2023-10-10",
          },
          {
            id: "2",
            carImage: "/images/cars/car-2.jpg",
            carMake: "BMW",
            yourBid: 1200000,
            highestBid: 1250000,
            auctionEnd: "2023-10-10",
          },
          {
            id: "3",
            carImage: "/images/cars/car-3.jpg",
            carMake: "BMW",
            yourBid: 1200000,
            highestBid: 1250000,
            auctionEnd: "2023-10-10",
          },
          {
            id: "4",
            carImage: "/images/cars/car-4.jpg",
            carMake: "BMW",
            yourBid: 1200000,
            highestBid: 1250000,
            auctionEnd: "2023-10-10",
          },
          {
            id: "5",
            carImage: "/images/cars/car-5.jpg",
            carMake: "BMW",
            yourBid: 1200000,
            highestBid: 1250000,
            auctionEnd: "2023-10-10",
          },
        ]);
      } catch (error) {
        console.error("Error fetching bidding history:", error);
        setBids([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBiddingHistory();
  }, []);

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

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
          <h1 className="text-2xl font-bold text-black mb-6">History</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 md:px-6 pb-8 pt-32">
        {/* Tabs */}
        <div className="flex gap-0 mb-6 bg-gray-100 rounded-full p-1 w-fit">
          <Link href="/order-history">
            <button
              className={`px-6 py-2 font-medium transition rounded-full ${
                activeTab === "order"
                  ? "bg-[#EE8E32] text-white shadow-md"
                  : "text-gray-600 bg-transparent"
              }`}
            >
              Order History
            </button>
          </Link>
          <button
            onClick={() => setActiveTab("bidding")}
            className={`px-6 py-2 font-medium transition rounded-full ${
              activeTab === "bidding"
                ? "bg-[#EE8E32] text-white shadow-md"
                : "text-gray-600 bg-transparent"
            }`}
          >
            Bidding History
          </button>
        </div>

        {/* Bidding History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : bids.length > 0 ? (
            bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-gray-100 rounded-lg p-4 flex items-center gap-4"
              >
                {/* Car Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={bid.carImage}
                    alt={bid.carMake}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Bid Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {bid.carMake}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      Your Bid: <span className="font-semibold">{formatCurrency(bid.yourBid)}</span>
                    </p>
                    <p className="text-gray-700">
                      Highest Bid: <span className="font-semibold">{formatCurrency(bid.highestBid)}</span>
                    </p>
                    <p className="text-[#EE8E32] font-semibold">
                      Auction End: {bid.auctionEnd}
                    </p>
                  </div>
                </div>

                {/* Increase Bid Button */}
                <div className="flex-shrink-0">
                  <Link href={`/bidding-history/increase-bid?id=${bid.id}`}>
                    <button className="bg-[#EE8E32] hover:bg-[#d87a28] text-white px-4 py-2 rounded-lg font-medium transition">
                      Increase Bid
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No bidding history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

