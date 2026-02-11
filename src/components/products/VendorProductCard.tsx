"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import type { Product } from "@/services/product.api";
import { vendorApi } from "@/services/vendor.api";

interface VendorProductCardProps {
  product: Product;
}

function VendorProductCard({ product }: VendorProductCardProps) {
  const [vendorLogo, setVendorLogo] = useState<string | null>(null);
  const [vendorStoreName, setVendorStoreName] = useState<string | null>(null);

  // Fetch vendor details
  useEffect(() => {
    const fetchVendorDetails = async () => {
      if (!product.vendor?.id) return;
      
      try {
        const vendorResponse = await vendorApi.getById(product.vendor.id);
        const vendor = vendorResponse.data.vendor;
        const companyDocs = (vendor as any).companyDocs as any || {};
        const businessDetails = companyDocs?.businessDetails || {};
        
        setVendorLogo((vendor as any).profileImageUrl || null);
        setVendorStoreName(businessDetails.storeName || vendor.name || null);
      } catch (error) {
        console.error('Error fetching vendor details:', error);
      }
    };

    fetchVendorDetails();
  }, [product.vendor?.id]);

  const price = parseFloat(product.priceMinor) / 100;
  
  // Get default icon mapping
  const getDefaultIcon = (key: string) => {
    const iconMap: Record<string, string> = {
      model: "/icons/carLine.svg",
      condition: "/icons/carInfo/solar_star-line-duotone.svg",
      kilometers: "/icons/carInfo/icomoon-free_meter.svg",
      mileage: "/icons/carInfo/icomoon-free_meter.svg",
      gearType: "/icons/carInfo/mingcute_steering-wheel-line.svg",
      transmission: "/icons/carInfo/mingcute_steering-wheel-line.svg",
      engineCapacity: "/icons/carInfo/ph_engine.svg",
      engine: "/icons/carInfo/ph_engine.svg",
      carForm: "/icons/carInfo/lucide_car.svg",
      guarantee: "/icons/carInfo/hugeicons_tick-04.svg",
      manufactureYear: "/icons/carInfo/material-symbols_modeling-outline.svg",
      city: "/icons/carInfo/solar_city-broken.svg",
      color: "/icons/carInfo/qlementine-icons_paint-drop-16.svg",
      fuel: "/icons/carInfo/solar_fuel-broken.svg",
      motorType: "/icons/carInfo/mdi_motor-outline.svg",
    };
    return iconMap[key.toLowerCase()] || "/icons/carInfo/solar_star-line-duotone.svg";
  };
  
  // Extract first 3 filter values with icons
  const getSpecifications = () => {
    if (!product.filterValues || product.filterValues.length === 0) {
      return [];
    }
    
    return product.filterValues.slice(0, 3).map((fv) => {
      const filter = fv.filter;
      const iconUrl = filter?.iconUrl || getDefaultIcon(filter?.key || '');
      const value = fv.value;
      
      // Format value based on filter key
      const filterKey = filter?.key?.toLowerCase() || '';
      let displayValue = value;
      
      if (filterKey.includes('mileage') || filterKey.includes('kilometers') || filterKey.includes('km')) {
        displayValue = `${value} KM`;
      } else if (filterKey.includes('engine') || filterKey.includes('capacity') || filterKey.includes('cc')) {
        displayValue = `${value} CC`;
      }
      
      return {
        value: displayValue,
        iconUrl: iconUrl,
      };
    });
  };

  const specifications = getSpecifications();
  const displayVendorLogo = vendorLogo || "/icons/honda.svg";
  const displayVendorName = vendorStoreName || product.vendor?.name || "Vendor";
  const displayVendorId = product.vendor?.id;

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/product-preview?id=${product.id}`;
  };

  const handleVendorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayVendorId) {
      window.location.href = `/vendor-store/${displayVendorId}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow">
      {/* Product Image Section */}
      <div 
        onClick={handleProductClick}
        className="relative w-full h-56 md:h-64 lg:h-72 cursor-pointer"
      >
        <Image
          src={product.media?.[0]?.url || "/images/cars/car-1.jpg"}
          alt={product.title}
          fill
          className="object-cover"
          quality={100}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Bookmark Icon */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
          <div className="w-9 h-9 bg-white rounded flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* Title and Price Row */}
        <div className="flex items-start justify-between mb-3">
          <h3 
            onClick={handleProductClick}
            className="text-[#333333] font-medium text-sm sm:text-base cursor-pointer hover:text-[#EE8E32] transition-colors flex-1 mr-2"
          >
            {product.title}
          </h3>
          <p className="text-[#ee8e31] font-semibold text-xl flex-shrink-0">
            {price.toLocaleString()} {product.currency}
          </p>
        </div>

        {/* Specifications Tags with Icons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specifications.map((spec, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-xs sm:text-sm bg-gray-100 rounded-full text-[#666666] flex items-center gap-1.5"
            >
              <Image
                src={spec.iconUrl}
                alt=""
                width={14}
                height={14}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getDefaultIcon('');
                }}
              />
              {spec.value}
            </span>
          ))}
        </div>

        {/* Vendor Information Section */}
        {displayVendorId && (
          <div 
            onClick={handleVendorClick}
            className="flex items-center gap-2 pt-3 border-t border-gray-200 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 transition-colors"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={displayVendorLogo}
                alt={displayVendorName}
                fill
                className="object-cover"
                quality={100}
                sizes="32px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/icons/honda.svg";
                }}
              />
            </div>
            <span className="text-sm font-medium text-[#333333] hover:text-[#EE8E32] transition-colors">
              {displayVendorName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorProductCard;
