"use client";
import CarCircle from "@/components/home/CarCircle";
import CarSlider from "@/components/home/CarSlider";
import Hero from "@/components/general/Hero";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SimpleCarSlider from "@/components/home/SimpleCarSlider";
import { useRouter } from "next/navigation";
import { HiCheckCircle } from "react-icons/hi2";

const page = () => {
  const router = useRouter();
  const [showGetVerified, setShowGetVerified] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          // Show Get Verified button if user is registered but not verified
          if (userData.customerType === 'registered' || userData.customerType === 'verification_pending') {
            setShowGetVerified(true);
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      }
    }
  }, []);

  return (
    <div className="bg-[#f4f5f6] pb-14">
      <Hero />
      {/* Get Verified Button - Floating */}
      {showGetVerified && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => router.push("/upload-cnic")}
            className="flex items-center gap-2 bg-[#EE8E32] text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:bg-[#d87a28] transition transform hover:scale-105"
          >
            <HiCheckCircle size={20} />
            <span>Get Verified</span>
          </button>
        </div>
      )}
      <p className="text-center py-10 font-semibold text-md">Trendy stories</p>
      <CarCircle />
      <p className="flex justify-center items-center gap-4 font-semibold text-md">
        <Image
          src={"/icons/biddingIcon.svg"}
          alt="icon"
          width={20}
          height={20}
        />{" "}
        Top biddings
      </p>
      <div className="max-w-3xl mx-auto py-8  text-center text-gray-600  sm:px-6">
        Discover the world&apos;s top and biggest auction marketplace with our
        stunning bidding items. We desire to contribute to your happiness,
        achievement, and future expansion.
      </div>
      <CarSlider />
      <p className="flex justify-center items-center gap-4 font-semibold text-md">
        <Image src={"/icons/buyBag.svg"} alt="icon" width={20} height={20} />{" "}
        Items to buy
      </p>
      <div className="max-w-3xl mx-auto py-8  text-center text-gray-600  sm:px-6">
        Discover the world&apos;s top and biggest auction marketplace with our
        stunning bidding items. We desire to contribute to your happiness,
        achievement, and future expansion.
      </div>
      <SimpleCarSlider type="products" />

      <p className="flex justify-center items-center gap-4 font-semibold text-md">
        <Image
          src={"/icons/mdi_handshake.svg"}
          alt="icon"
          width={20}
          height={20}
        />{" "}
        Offering by another vendors
      </p>
      <div className="max-w-3xl mx-auto py-8  text-center text-gray-600  sm:px-6">
        Discover the world&apos;s top and biggest auction marketplace with our
        stunning bidding items. We desire to contribute to your happiness,
        achievement, and future expansion.
      </div>
      <SimpleCarSlider type="vendor" />
    </div>
  );
};

export default page;
