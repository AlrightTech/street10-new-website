"use client";
import Image from "next/image";
import React from "react";

const categories = [
  { name: "Model", icon: "/icons/carLine.svg", feature: "Mercedes" },
  {
    name: "Condition",
    icon: "/icons/carInfo/solar_star-line-duotone.svg",
    feature: "Used-Perfect",
  },
  {
    name: "Kilometers",
    icon: "/icons/carInfo/icomoon-free_meter.svg",
    feature: "113,000",
  },
  {
    name: "Gear Type",
    icon: "/icons/carInfo/mingcute_steering-wheel-line.svg",
    feature: "Automatic",
  },
  {
    name: "Engine Capacity",
    icon: "/icons/carInfo/ph_engine.svg",
    feature: "CC 2000",
  },

  {
    name: "Car Form",
    icon: "/icons/carInfo/lucide_car.svg",
    feature: "SUV",
  },
  {
    name: "Guarantee",
    icon: "/icons/carInfo/hugeicons_tick-04.svg",
    feature: "No",
  },
  {
    name: "Manufacture Year",
    icon: "/icons/carInfo/material-symbols_modeling-outline.svg",
    feature: "2020",
  },
  {
    name: "City",
    icon: "/icons/carInfo/solar_city-broken.svg",
    feature: "Doha",
  },
  {
    name: "Color",
    icon: "/icons/carInfo/qlementine-icons_paint-drop-16.svg",
    feature: "Black",
  },
  {
    name: "Fuel",
    icon: "/icons/carInfo/solar_fuel-broken.svg",
    feature: "Gasoline",
  },
  {
    name: "Motor Type",
    icon: "/icons/carInfo/mdi_motor-outline.svg",
    feature: "GLC",
  },
];

function AboutCar() {
  return (
    <div className="bg-white mx-5 px-5 pt-5 pb-10 rounded-2xl">
      <h2 className="font-semibold text-xl pb-5">About The Car</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="w-full text-lg flex flex-col items-center justify-center rounded-xl
             bg-white shadow-[0px_0px_6px_0px_#00000040] hover:shadow-[0px_0px_12px_0px_#00000060]
             hover:bg-[#f6eae0] cursor-pointer hover:text-[#ee8e31]
              font-medium px-6 py-8 transition-all duration-200"
          >
            <Image src={cat.icon} alt="icon" width={40} height={40} />
            <p className="font-semibold my-3 ">{cat?.feature}</p>
            <p>{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AboutCar;
