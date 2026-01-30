"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/services/user.api";

interface BidHistoryItem {
  id: string;
  carImage: string;
  carMake: string;
  yourBid: number;
  highestBid: number;
  auctionEnd: string;
  auctionId: string;
  status: 'active' | 'won' | 'lost' | 'outbid';
  orderId?: string; // If won, link to order
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
        const response = await userApi.getUserBids({ limit: 50 });
        
        if (response.success && response.data) {
          // Group bids by auctionId - one entry per auction
          const bidsByAuction = new Map<string, any[]>();
          
          response.data.forEach((bid: any) => {
            const auctionId = bid.auctionId;
            if (!bidsByAuction.has(auctionId)) {
              bidsByAuction.set(auctionId, []);
            }
            bidsByAuction.get(auctionId)!.push(bid);
          });
          
          // Transform grouped bids to BidHistoryItem format (one per auction)
          const transformedBids: BidHistoryItem[] = Array.from(bidsByAuction.entries()).map(([auctionId, auctionBids]) => {
            // Sort bids by amount descending to get the highest bid
            const sortedBids = [...auctionBids].sort((a, b) => parseFloat(b.amountMinor) - parseFloat(a.amountMinor));
            
            // Get the highest bid the user placed for this auction
            const highestUserBid = sortedBids[0];
            const product = highestUserBid.auction?.product;
            const firstMedia = product?.media?.[0];
            const userHighestBidAmount = parseFloat(highestUserBid.amountMinor) || 0;
            const auctionState = highestUserBid.auction?.state;
            const isEnded = auctionState === 'ended' || auctionState === 'settled';
            
            // Get highest bid overall from auction
            // Backend includes winningBid in the auction object (highest bid for live, winning bid for ended)
            const winningBid = highestUserBid.auction?.winningBid;
            const highestBidOverall = winningBid 
              ? parseFloat(winningBid.amountMinor)
              : userHighestBidAmount; // Fallback to user's highest bid if no winningBid

            // Determine status based on auction state and winning bid
            let status: BidHistoryItem['status'] = 'active';
            if (isEnded) {
              // Check if any of the user's bids is the winning bid
              const hasWinningBid = auctionBids.some(b => b.isWinning);
              status = hasWinningBid ? 'won' : 'lost';
            } else if (winningBid && winningBid.userId !== highestUserBid.userId) {
              status = 'outbid';
            } else {
              status = 'active';
            }
            
            // Use status from backend if available (from highest bid)
            if (highestUserBid.status) {
              status = highestUserBid.status as BidHistoryItem['status'];
            }
            
            // Get orderId from the winning bid if available
            const winningBidInAuction = auctionBids.find(b => b.isWinning);
            const orderId = winningBidInAuction?.orderId || highestUserBid.orderId;
            
            return {
              id: highestUserBid.id, // Use highest bid's ID as the entry ID
              auctionId: auctionId,
              carImage: firstMedia?.url || "/images/cars/car-1.jpg",
              carMake: product?.title || "Product",
              yourBid: userHighestBidAmount / 100, // User's highest bid for this auction
              highestBid: highestBidOverall / 100, // Overall highest bid
              auctionEnd: highestUserBid.auction?.endAt ? new Date(highestUserBid.auction.endAt).toISOString().split('T')[0] : "",
              status,
              orderId: orderId || undefined,
            };
          });
          
          // Sort by auction end date (most recent first) or by placed date
          transformedBids.sort((a, b) => {
            const dateA = new Date(a.auctionEnd).getTime();
            const dateB = new Date(b.auctionEnd).getTime();
            return dateB - dateA; // Most recent first
          });
          
          setBids(transformedBids);
        } else {
          setBids([]);
        }
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
    return `QAR ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; className: string }> = {
      active: { text: 'Active', className: 'bg-green-100 text-green-800' },
      won: { text: 'Won', className: 'bg-blue-100 text-blue-800' },
      lost: { text: 'Lost', className: 'bg-gray-100 text-gray-800' },
      outbid: { text: 'Outbid', className: 'bg-orange-100 text-orange-800' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.text}
      </span>
    );
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
          <button
            onClick={() => {
              // Use full-page navigation for immediate response
              window.location.href = "/order-history";
            }}
            className={`px-6 py-2 font-medium transition rounded-full ${
              activeTab === "order"
                ? "bg-[#EE8E32] text-white shadow-md"
                : "text-gray-600 bg-transparent"
            }`}
          >
            Order History
          </button>
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

        {/* Bidding History Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : bids.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Your Bid</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Highest Bid</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Auction End</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={bid.carImage}
                            alt={bid.carMake}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <span className="font-semibold text-black">{bid.carMake}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(bid.status)}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        <span className="font-semibold">{formatCurrency(bid.yourBid)}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        <span className="font-semibold">{formatCurrency(bid.highestBid)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[#EE8E32] font-semibold">{bid.auctionEnd}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {bid.status === 'won' && bid.orderId ? (
                          <button
                            onClick={() => {
                              window.location.href = `/order-preview?orderId=${bid.orderId}`;
                            }}
                            className="bg-[#EE8E32] hover:bg-[#d87a28] text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm"
                          >
                            View Order
                          </button>
                        ) : bid.status === 'active' || bid.status === 'outbid' ? (
                          <button
                            onClick={() => {
                              window.location.href = `/car-preview?id=${bid.auctionId}&type=auction`;
                            }}
                            className="bg-[#EE8E32] hover:bg-[#d87a28] text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm"
                          >
                            {bid.status === 'outbid' ? 'Increase Bid' : 'View Auction'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

