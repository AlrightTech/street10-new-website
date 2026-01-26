"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { categoryApi } from "@/services/category.api";
import type { Category } from "@/services/category.api";

interface AuctionProps {
  productType?: 'bidding' | 'ecommerce' | 'vendor';
  onCategoryClick?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

function Auction({ productType = 'bidding', onCategoryClick, selectedCategoryId }: AuctionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryApi.getWithProducts(productType);
        if (response.success && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [productType]);

  if (loading) {
    return (
      <div className="w-full px-20 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="w-full text-lg flex flex-col items-center justify-center rounded-xl bg-white px-6 py-8 animate-pulse"
            >
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
              <div className="mt-3 h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null; // Don't show anything if no categories have products
  }

  return (
    <div className="w-full px-20 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => {
                if (onCategoryClick) {
                  onCategoryClick(cat.id);
                }
              }}
              className={`w-full text-lg flex flex-col items-center justify-center rounded-xl   
                         hover:shadow-md cursor-pointer transition-all duration-200 px-6 py-8 ${
                           isSelected
                             ? 'bg-[#f6eae0] text-[#ee8e31] shadow-md'
                             : 'bg-white hover:bg-[#f6eae0] hover:text-[#ee8e31] text-[#666666]'
                         }`}
            >
              <Image 
                src={cat.icon || "/icons/categories.svg"} 
                alt={cat.name} 
                width={40} 
                height={40} 
              />
              <p className="mt-3 font-medium">{cat.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Auction;
