"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategoriesSlider from "../general/CategoriesSlider";
import { productApi } from "@/services/product.api";
import type { Product } from "@/services/product.api";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll({
          status: "active",
          limit: 20,
        });
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Transform product data to match the car format
  const cars = products.map((product) => {
    const price = parseFloat(product.priceMinor) / 100;
    return {
      id: product.id,
      src: product.media?.[0]?.url || "/images/cars/car-1.jpg",
      bid: `${price.toLocaleString()} QAR`,
      end: "Available",
      plate: product.title || "Product",
      provider: [
        "Provided by us",
        product.categories?.[0]?.name || "General",
        "In Stock",
      ],
    };
  });

  // Handle product click - always navigate to detail page
  // Registration will be handled on the detail page
  const handleCarClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Always navigate to detail page - registration will be handled there
    router.push(`/car-preview?id=${id}&type=product`);
    // Force scroll to top on navigation
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-5 pb-20 px-4 md:px-10 lg:px-20 relative">
      <CategoriesSlider category={category} />
      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Loading products...</p>
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
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>

    </section>
  );
}

export default Cars;
