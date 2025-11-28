import CarCircle from "@/components/home/CarCircle";
import CarSlider from "@/components/home/CarSlider";
import Hero from "@/components/general/Hero";
import Image from "next/image";
import React from "react";
import SimpleCarSlider from "@/components/home/SimpleCarSlider";

const page = () => {
  return (
    <div className="bg-[#f4f5f6] pb-14">
      <Hero />
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
