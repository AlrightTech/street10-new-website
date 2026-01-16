"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CiBookmark } from "react-icons/ci";
import { FaBookmark } from "react-icons/fa";
import { auctionApi } from "@/services/auction.api";
import { productApi } from "@/services/product.api";
import type { Auction } from "@/services/auction.api";
import type { Product } from "@/services/product.api";

type FilterType = "Cars" | "Dealers" | "Car Services" | "Spare Part";

const filters = [
  { name: "Cars" as FilterType, icon: "/icons/car.svg" },
  { name: "Dealers" as FilterType, icon: "/icons/dealer.svg" },
  { name: "Car Services" as FilterType, icon: "/icons/carService.svg" },
  { name: "Spare Part" as FilterType, icon: "/icons/spareParts.svg" },
];

export default function SavedItemsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Cars");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        setLoading(true);
        // Fetch auctions and products
        const [auctionsResponse, productsResponse] = await Promise.all([
          auctionApi.getActive({ limit: 20 }).catch(() => ({ data: [] })),
          productApi.getAll({ status: "active", limit: 20 }).catch(() => ({ data: [] })),
        ]);
        
        setAuctions(auctionsResponse.data || []);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error("Error fetching saved items:", error);
        setAuctions([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  // Transform data to car format
  const cars = selectedFilter === "Cars" 
    ? auctions.map((auction) => {
        const price = parseFloat(auction.currentBid?.amountMinor || "0") / 100;
        return {
          id: auction.id,
          src: auction.product?.media?.[0]?.url || "/images/cars/car-1.jpg",
          title: auction.product?.title || "Mercedes car",
          price: `${price.toLocaleString()} QAR`,
          specs: [
            "113.000 KM",
            "Automatics",
            "Spare Parts",
          ],
          brand: "Mercedes car",
          brandIcon: "/images/mercedes-icon.png",
        };
      })
    : products.map((product) => {
        const price = parseFloat(product.priceMinor || "0") / 100;
        return {
          id: product.id,
          src: product.media?.[0]?.url || "/images/cars/car-1.jpg",
          title: product.title || "Mercedes car",
          price: `${price.toLocaleString()} QAR`,
          specs: [
            "113.000 KM",
            "Automatics",
            "Spare Parts",
          ],
          brand: "Mercedes car",
          brandIcon: "/images/mercedes-icon.png",
        };
      });

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
          <h1 className="text-2xl font-bold text-black">Saved Items</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 md:px-6 pb-8 pt-24">
        {/* Bidding Section Title */}
        <h2 className="text-xl font-bold text-black mb-4">Bidding</h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.name}
              onClick={() => setSelectedFilter(filter.name)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
                selectedFilter === filter.name
                  ? "bg-gray-200 text-[#EE8E32] shadow-md"
                  : "bg-white text-[#666666] shadow-sm hover:shadow-md"
              }`}
            >
              <Image
                src={filter.icon}
                alt={filter.name}
                width={16}
                height={16}
                className={selectedFilter === filter.name ? "opacity-100" : "opacity-70"}
              />
              <span>{filter.name}</span>
            </button>
          ))}
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : cars.length > 0 ? (
            cars.map((car, index) => (
              <Link
                key={car.id || index}
                href={selectedFilter === "Cars" 
                  ? `/car-preview?id=${car.id}&type=auction`
                  : `/product-preview?id=${car.id}`
                }
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative w-full flex-shrink-0">
                  <Image
                    src={car.src}
                    alt={car.title}
                    width={400}
                    height={250}
                    className="w-full h-56 md:h-64 lg:h-72 object-cover"
                  />

                  {/* Bookmark Icon */}
                  <div className="absolute top-3 right-3">
                    <FaBookmark size={24} className="text-white drop-shadow-lg" fill="currentColor" />
                  </div>
                </div>

                {/* Car info */}
                <div className="p-4 border-t mt-auto flex flex-col justify-between">
                  <div className="mb-2 sm:mb-3 flex justify-between items-center">
                    <p className="text-[#333333] font-medium text-sm sm:text-base">
                      {car.title}
                    </p>
                    <p className="text-[#EE8E32] font-semibold text-lg">
                      {car.price}
                    </p>
                  </div>
                  
                  {/* Specifications */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.specs.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs sm:text-sm bg-gray-100 rounded-full text-[#666666]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Brand Icon & Name */}
                  <div className="flex justify-start gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <Image
                        src={car.brandIcon || "/images/mercedes-icon.png"}
                        alt={car.brand}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-sm text-[#666666]">{car.brand}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No saved items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

