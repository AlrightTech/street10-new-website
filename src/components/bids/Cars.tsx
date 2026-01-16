"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategoriesSlider from "../general/CategoriesSlider";
import { auctionApi } from "@/services/auction.api";
import type { Auction } from "@/services/auction.api";

const category = [
  { title: "All", icon: "/icons/categories.svg" },
  { title: "Dealer", icon: "/icons/dealer.svg" },
  { title: "Car Service", icon: "/icons/carService.svg" },
  { title: "Spare Parts", icon: "/icons/spareParts.svg" },
  { title: "", icon: "/icons/arrowsDown.svg" },
  { title: "", icon: "/icons/filter.svg" },
];

function Cars() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await auctionApi.getActive({ limit: 20 });
        console.log("Active auctions API response:", response);
        console.log("Auctions data:", response.data);
        console.log("Auctions count:", response.data?.length);
        setAuctions(response.data || []);
      } catch (error) {
        console.error("Error fetching active auctions:", error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Handle car click - always navigate to detail page
  // Registration/verification will be handled on the detail page
  const handleCarClick = (e: React.MouseEvent, carId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Direct navigation - guaranteed to work
    router.push(`/car-preview?id=${carId}&type=auction`);
  };

  // Transform auction data to match the car format
  const cars = auctions.map((auction) => {
    const currentBid = auction.currentBid
      ? parseFloat(auction.currentBid.amountMinor) / 100
      : 0;
    const endDate = new Date(auction.endAt);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const end = `${days}d : ${hours}h : ${minutes}m`;

    return {
      id: auction.id,
      src: auction.product?.media?.[0]?.url || "/images/cars/car-1.jpg",
      bid: `${currentBid.toLocaleString()} QAR`,
      end: end,
      plate: auction.product?.title || "Auction Item",
      provider: ["Provided by us", auction.type || "Auction", "Active"],
    };
  });

  return (
    <section className="pt-5 pb-20 px-4 md:px-10 lg:px-20 relative">
      <CategoriesSlider category={category} />
      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Loading auctions...</p>
          </div>
        ) : cars.length > 0 ? (
          cars.map((car, index) => (
            <div
              key={car.id || index}
              onClick={(e) => handleCarClick(e, car.id)}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative w-full flex-shrink-0">
                <Image
                  src={car.src}
                  alt={`Car ${index + 1}`}
                  width={400}
                  height={250}
                  className="w-full h-56 md:h-64 lg:h-72 object-cover"
                />

                {/* Top-right badges */}
                <div className="flex gap-2 absolute top-3 right-3 md:top-4 md:right-4 pointer-events-none z-10">
                  <Image
                    src={"/icons/frwrd.svg"}
                    alt="forward"
                    width={36}
                    height={36}
                  />
                  <Image
                    src={"/icons/badge-1.svg"}
                    alt="badge"
                    width={36}
                    height={36}
                  />
                </div>
                {/* Auction info overlay */}
                <div
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2
                          flex flex-col sm:flex-row items-center justify-between gap-4
                          px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-white
                          bg-white/20 backdrop-blur-md shadow-lg w-[90%] sm:w-[85%] lg:w-[80%] pointer-events-none z-10"
                >
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm">Auction ends</p>
                    <p className="text-sm font-medium mt-1">{car.end}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs sm:text-sm">Current Bid</p>
                    <p className="text-sm font-medium mt-1">{car.bid}</p>
                  </div>
                </div>
              </div>

              {/* Car info */}
              <div className="p-4 border-t mt-auto flex flex-col justify-between">
                <p className="text-[#333333] font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  {car.plate}
                </p>
                <div className="flex flex-wrap gap-2">
                  {car.provider.map((info, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs sm:text-sm bg-white rounded-full text-[#666666] shadow-[0px_1px_4px_0px_#0000001A]"
                    >
                      {info}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No auctions available</p>
          </div>
        )}
      </div>

    </section>
  );
}

export default Cars;
