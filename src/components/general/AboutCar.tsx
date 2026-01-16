"use client";
import Image from "next/image";
import React from "react";

interface FilterValue {
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
}

interface AboutCarProps {
  filterValues: FilterValue[];
}

function AboutCar({ filterValues }: AboutCarProps) {
  // Default icon mapping for common filter keys (fallback if iconUrl not provided)
  const getDefaultIcon = (key: string) => {
    const iconMap: Record<string, string> = {
      model: "/icons/carLine.svg",
      condition: "/icons/carInfo/solar_star-line-duotone.svg",
      kilometers: "/icons/carInfo/icomoon-free_meter.svg",
      mileage: "/icons/carInfo/icomoon-free_meter.svg",
      gearType: "/icons/carInfo/mingcute_steering-wheel-line.svg",
      engineCapacity: "/icons/carInfo/ph_engine.svg",
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

  if (filterValues.length === 0) {
    return null; // Don't show section if no filters
  }

  return (
    <div className="bg-white mx-5 px-5 pt-5 pb-10 rounded-2xl">
      <h2 className="font-semibold text-xl pb-5">About The Car</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 justify-items-center">
        {filterValues.map((filterValue) => {
          const filter = filterValue.filter;
          const label = filter.i18n?.en?.label || filter.key;
          const iconUrl = filter.iconUrl || getDefaultIcon(filter.key);
          
          return (
            <div
              key={filterValue.id}
              className="w-full flex flex-col items-center justify-center rounded-xl border border-[#f2f2f2]
               bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.12)]
               hover:bg-[#fdf7f1] cursor-pointer
                px-4 py-6 transition-all duration-200"
            >
              <Image
                src={iconUrl}
                alt={label}
                width={32}
                height={32}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultIcon(filter.key);
                }}
                className="object-contain"
                style={{ 
                  filter: iconUrl && !iconUrl.startsWith('/icons/') 
                    ? 'none' 
                    : 'brightness(0) saturate(100%) invert(58%) sepia(90%) saturate(2000%) hue-rotate(2deg) brightness(1) contrast(1)'
                }}
              />
              <p className="font-semibold my-2 text-base text-[#2b2b2b]">{filterValue.value}</p>
              <p className="text-sm text-[#555555]">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AboutCar;
