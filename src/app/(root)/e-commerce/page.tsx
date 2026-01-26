import Hero from "@/components/general/Hero";
import Image from "next/image";
import React from "react";
import Cars from "@/components/commerce/Cars";

const page = () => {
  return (
    <div className="bg-[#f4f5f6] pb-14">
      <Hero />

      <p className="flex justify-center items-center gap-3 font-semibold text-md pt-12">
        <Image
          src={"/icons/carbonCategories.svg"}
          alt="icon"
          width={20}
          height={20}
        />{" "}
        E-commerce categories
      </p>
      <Cars />
    </div>
  );
};

export default page;
