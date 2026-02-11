"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { productApi } from "@/services/product.api";
import type { Vendor } from "@/services/vendor.api";

interface VendorStoreCardProps {
  vendor: Vendor;
}

function VendorStoreCard({ vendor }: VendorStoreCardProps) {
  const [productCount, setProductCount] = useState<number>(0);
  
  // Get vendor category from companyDocs or use a default
  const companyDocs = (vendor as any).companyDocs as any;
  const businessDetails = companyDocs?.businessDetails || {};
  const vendorCategory = businessDetails.category || "General";
  const vendorDescription = businessDetails.description || businessDetails.storeName || "Your trusted vendor";
  
  // Get store name from businessDetails.storeName or fallback to vendor.name
  const storeName = businessDetails.storeName || vendor.name;
  
  // Get vendor logo/profile image
  const vendorLogo = (vendor as any).profileImageUrl || "/icons/honda.svg";
  const vendorBanner = businessDetails.bannerImage || "/images/vendor-banner.jpg";
  
  // Fetch product count for this vendor
  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await productApi.getAll({ vendor_id: vendor.id, status: 'active', limit: 1 });
        // Get total from pagination if available, otherwise use data length
        const count = response.pagination?.total || response.data?.length || 0;
        setProductCount(count);
      } catch (error) {
        console.error('Error fetching vendor product count:', error);
      }
    };
    fetchProductCount();
  }, [vendor.id]);
  
  // Rating will be calculated from reviews when review system is implemented
  // For now, using a default value that can be updated when reviews are available
  const rating = 4.8;

  const handleViewStore = () => {
    window.location.href = `/vendor-store/${vendor.id}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
      {/* Banner Image */}
      <div className="relative w-full h-48 mb-10">
        {/* Banner Image Container */}
        <div className="absolute inset-0 overflow-hidden rounded-t-xl">
          <Image
            src={vendorBanner}
            alt={`${storeName} banner`}
            fill
            className="object-cover"
            quality={100}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/vendor-banner.jpg";
            }}
          />
        </div>
        {/* Vendor Logo Overlay - Fixed positioning with proper z-index */}
        <div className="absolute bottom-0 left-4 transform translate-y-1/2 z-30">
          <div className="relative w-20 h-20 rounded-full bg-white p-1 shadow-lg flex items-center justify-center overflow-hidden z-30">
            <Image
              src={vendorLogo}
              alt={storeName}
              fill
              className="object-cover rounded-full"
              quality={100}
              priority
              sizes="80px"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/icons/honda.svg";
              }}
            />
          </div>
        </div>
      </div>

      {/* Vendor Info - Adjusted padding since logo is now properly positioned */}
      <div className="p-6 pt-10 flex flex-col flex-grow">
        {/* Vendor Name and Category */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{storeName}</h3>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 ml-2">
            {vendorCategory}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vendorDescription}</p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium">{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>{productCount} Products</span>
          </div>
        </div>

        {/* View Store Button */}
        <button
          onClick={handleViewStore}
          className="w-full bg-[#EE8E32] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#d67a1f] transition-colors mt-auto"
        >
          View Store
        </button>
      </div>
    </div>
  );
}

export default VendorStoreCard;
