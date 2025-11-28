import Image from "next/image";
import React from "react";

function Hero() {
  return (
    <div className="relative w-full h-[650px]">
      {/* Background Image */}
      <Image
        src="/images/street/vendorFrame.png"
        alt="car"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 flex flex-between  items-center justify-start px-28">
        <div>
          <div className="flex justify-between  items-center">
            <div className="flex justify-start gap-4 items-center">
              <div>
                <Image
                  src={"/icons/tCar.svg"}
                  alt="badge"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <p className="font-semibold text-base md:text-lg  ">
                  altarek automative
                </p>
                <p className="text-sm text-[#555555]">Cars</p>
              </div>
            </div>
            <div className="flex justify-center items-center gap-5">
              <Image
                src={"/icons/phone.svg"}
                alt="badge"
                className="cursor-pointer"
                width={40}
                height={40}
              />{" "}
              <Image
                src={"/icons/whatApp.svg"}
                alt="badge"
                className="cursor-pointer"
                width={40}
                height={40}
              />{" "}
              <Image
                src={"/icons/location.svg"}
                alt="badge"
                className="cursor-pointer"
                width={40}
                height={40}
              />
            </div>
          </div>

          <p className="font-semibold text-base md:text-lg my-5 text-[#555555]">
            More about:
          </p>
          <p className="max-w-5xl text-base md:text-md text-[#555555] mb-8 ">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy
            text ever since the 1500s,
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
