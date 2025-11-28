"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CarPreview from "@/components/general/CarPreview";
import { auctionApi } from "@/services/auction.api";
import { productApi } from "@/services/product.api";
import type { Auction } from "@/services/auction.api";
import type { Product } from "@/services/product.api";

interface Car {
  id: number;
  name: string;
  status: "Ready" | "Sold" | "Pending";
  lastBid: string;
  bidder: string;
  timeLeft: string;
  images: string[];
  type: "auction" | "product";
  auction?: Auction;
  product?: Product;
}

function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type") || "auction"; // auction or product
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (type === "auction") {
          const response = await auctionApi.getById(id);
          const auction: Auction = response.data.auction;
          
          const currentBid = auction.currentBid
            ? parseFloat(auction.currentBid.amountMinor) / 100
            : 0;
          
          const endDate = new Date(auction.endAt);
          const now = new Date();
          const diff = endDate.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          const timeLeft = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

          setCar({
            id: parseInt(auction.id) || 0,
            name: auction.product?.title || "Auction Item",
            status: auction.state === "active" ? "Ready" : "Sold",
            lastBid: `${currentBid.toLocaleString()} QAR`,
            bidder: auction.currentBid?.userId || "No bids yet",
            timeLeft: timeLeft,
            images: auction.product?.media?.map((m) => m.url) || ["/images/cars/car-1.jpg"],
            type: "auction",
            auction: auction,
          });
        } else {
          const response = await productApi.getById(id);
          const product: Product = response.data.product;
          const price = parseFloat(product.priceMinor) / 100;

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
          });
        }
      } catch (error) {
        console.error("Error fetching car data:", error);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

export default Page;
