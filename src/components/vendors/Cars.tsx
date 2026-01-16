"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import CategoriesSlider from "../general/CategoriesSlider";
import Link from "next/link";
import { productApi } from "@/services/product.api";
import { vendorApi } from "@/services/vendor.api";
import type { Product } from "@/services/product.api";
import type { Vendor } from "@/services/vendor.api";

const category = [
  { title: "All", icon: "/icons/categories.svg" },
  { title: "Dealer", icon: "/icons/dealer.svg" },
  { title: "Car Service", icon: "/icons/carService.svg" },
  { title: "Spare Parts", icon: "/icons/spareParts.svg" },
  { title: "", icon: "/icons/arrowsDown.svg" },
  { title: "", icon: "/icons/filter.svg" },
];

function Cars() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, vendorsResponse] = await Promise.all([
          productApi.getAll({ status: "active", limit: 20 }),
          vendorApi.getAll({ status: "approved", limit: 20 }),
        ]);
        setProducts(productsResponse.data || []);
        setVendors(vendorsResponse.data || []);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setProducts([]);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create a map of vendor IDs to vendor data
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  // Transform product data to match the car format
  const cars = products.map((product) => {
    const price = parseFloat(product.priceMinor) / 100;
    const vendor = product.vendor?.id ? vendorMap.get(product.vendor.id) : null;
    return {
      id: product.id,
      price: `${price.toLocaleString()} QAR`,
      icon: "/icons/honda.svg",
      brand: vendor?.name || product.vendor?.name || "Vendor",
      src: product.media?.[0]?.url || "/images/cars/car-1.jpg",
      bid: `${price.toLocaleString()} QAR`,
      end: "Available",
      plate: product.title || "Product",
      provider: ["Provided by us", product.categories?.[0]?.name || "General", "In Stock"],
    };
  });

  return (
    <section className="pt-5 pb-20 px-4 md:px-10 lg:px-20 relative">
      <CategoriesSlider category={category} />
      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Loading vendor products...</p>
          </div>
        ) : cars.length > 0 ? (
          cars.map((car, index) => (
            <div
              key={car.id || index}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
            >
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Navigate to product detail page for vendor products
                window.location.href = `/product-preview?id=${car.id}`;
              }}
              className="cursor-pointer"
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
                <div className="flex gap-2 absolute top-3 right-3 md:top-4 md:right-4">
                  <Image
                    src={"/icons/badge-1.svg"}
                    alt="badge"
                    width={36}
                    height={36}
                  />
                </div>
              </div>

              {/* Car info */}
              <div className="p-4 border-t mt-auto flex flex-col justify-between">
                <div className="mb-2 sm:mb-3 flex justify-between items-center">
                  <p className="text-[#333333] font-medium  text-sm sm:text-base">
                    {car.plate}
                  </p>
                  <p className="text-[#ee8e31] font-semibold  text-xl ">
                    {car.price}
                  </p>
                </div>
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
                <div className="flex justify-start gap-4 items-center mt-5">
                  <Image src={car?.icon} alt="badge" width={36} height={36} />
                  <p> {car.brand}</p>
                </div>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No vendor products available</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cars;
