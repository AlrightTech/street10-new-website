"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CarPreview from "@/components/general/CarPreview";
import { auctionApi } from "@/services/auction.api";
import { productApi } from "@/services/product.api";
import type { Auction } from "@/services/auction.api";
import type { Product } from "@/services/product.api";

interface Car {
  id: number;
  name: string;
  status: "Ready" | "Sold" | "Pending" | "Live" | "Ended" | "Settled";
  lastBid: string;
  bidder: string;
  timeLeft: string;
  images: string[];
  type: "auction" | "product";
  auction?: Auction;
  product?: Product;
  documents?: Array<{
    id: string;
    url: string;
    title: string;
  }>;
  filterValues?: Array<{
    id: string;
    filterId: string;
    value: string;
    filter: {
      id: string;
      key: string;
      type: string;
      iconUrl?: string;
      i18n?: {
        en?: { label: string };
        ar?: { label: string };
      };
    };
  }>;
}

function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "auction"; // auction or product
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    // Reset state when id or type changes (navigation occurred)
    setLoading(true);
    setCar(null);

    const fetchData = async () => {
      if (!id) {
        if (isMountedRef.current) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMountedRef.current) {
          setLoading(true);
        }
        
        if (type === "auction") {
          const response = await auctionApi.getById(id);
          const auction: Auction = response.data.auction;
          
          // Get winning bid or current bid
          const winningBid = (auction as any).winningBid || auction.currentBid;
          const currentBid = winningBid
            ? parseFloat(winningBid.amountMinor) / 100
            : auction.currentBid
            ? parseFloat(auction.currentBid.amountMinor) / 100
            : 0;
          
          const endDate = new Date(auction.endAt);
          const now = new Date();
          const diff = endDate.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          const timeLeft = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

          // Map auction state to display status
          const getStatusFromState = (state: string, hasBid: boolean) => {
            switch (state) {
              case "scheduled":
                return "Pending";
              case "live":
                return "Ready";
              case "ended":
                return hasBid ? "Sold" : "Ended";
              case "settled":
                return "Sold";
              case "draft":
                return "Pending";
              default:
                return "Pending";
            }
          };

          const hasBid = !!winningBid || !!auction.currentBid;

          if (isMountedRef.current) {
            setCar({
              id: parseInt(auction.id) || 0,
              name: auction.product?.title || "Auction Item",
              status: getStatusFromState(auction.state, hasBid) as "Ready" | "Sold" | "Pending" | "Live" | "Ended" | "Settled",
              lastBid: `${currentBid.toLocaleString()} QAR`,
              bidder: winningBid?.userId || auction.currentBid?.userId || "No bids yet",
              timeLeft: timeLeft,
              images: auction.product?.media?.map((m) => m.url) || ["/images/cars/car-1.jpg"],
              type: "auction",
              auction: auction, // This includes depositAmount from the API
              documents: auction.product?.documents || [],
              filterValues: auction.product?.filterValues || [],
            });
          }
        } else {
          const response = await productApi.getById(id);
          const product: Product = response.data.product;
          const price = parseFloat(product.priceMinor) / 100;

          if (isMountedRef.current) {
            setCar({
              id: parseInt(product.id) || 0,
              name: product.title || "Product",
              status: product.status === "active" ? "Ready" : "Sold",
              lastBid: `${price.toLocaleString()} QAR`,
              bidder: "N/A",
              timeLeft: "00:00:00",
              images: product.media?.map((m) => m.url) || ["/images/cars/car-1.jpg"],
              type: "product",
              product: product,
              documents: product.documents || [],
              filterValues: product.filterValues || [],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching car data:", error);
        if (isMountedRef.current) {
          setCar(null);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [id, type]);

  if (loading) {
    return (
      <div className="bg-[#f5f6f4] pb-10 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="bg-[#f5f6f4] pb-10 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Car not found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f4] pb-10 ">
      <CarPreview car={car} />
    </div>
  );
}

function CarPreviewPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f5f6f4] pb-10 flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <Page />
    </Suspense>
  );
}

export default CarPreviewPage;
