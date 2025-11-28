import Image from "next/image";
import React from "react";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";

function Page() {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      {/* Order Header */}
      <h2 className="text-2xl font-semibold flex gap-3 items-center mb-6">
        Order no.29832
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-6">
          <p className="font-medium text-lg mb-6">Order Items (3)</p>

          {/* Item Card */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex justify-between items-center px-4 py-3 rounded-lg mb-4 bg-[#F3F5F6]"
            >
              <div className="flex items-center gap-6">
                <Image
                  src="/images/cars/car-2.jpg"
                  alt="car"
                  width={100}
                  height={100}
                  className="object-cover h-[60px] w-[80px] rounded-lg"
                />
                <p className="font-medium text-md">BMW CAR</p>
              </div>
              <p className="font-semibold text-[#EE8E32] text-lg">QAR 1200</p>
            </div>
          ))}

          {/* Payment Summary */}
          <div className="space-y-2 text-gray-700 bg-[#F3F5F6] p-4 rounded-lg mt-6">
            <h2 className="text-lg font-semibold mb-2">Payment Summary</h2>
            <div className="flex justify-between text-sm font-normal">
              <span>Subtotal</span>
              <span>QAR 1200</span>
            </div>
            <div className="flex justify-between text-sm font-normal">
              <span>Delivery</span>
              <span>QAR 50</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>QAR 1250</span>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6">
            <Link href="/e-commerce">
              <button className="  text-[#000000] py-3 rounded-lg bg-[#F3F5F6] px-5 cursor-pointer font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
            </Link>
            <Link href="/payment">
              <button className=" bg-[#EE8E32] flex gap-2 items-center text-white py-3 rounded-lg px-5 cursor-pointer font-semibold hover:bg-[#d67a1f] transition">
                Checkout
                <IoIosArrowRoundForward color="white" size={20} />
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-6">
          <div className="space-y-5 text-gray-700 mt-7">
            <div className="border border-[#0000001A] p-4 rounded-lg ">
              <p className="font-semibold text-md">Order Status</p>

              <div className="mt-2 px-3 py-2 bg-[#F3F5F6] rounded-lg">
                <p className="font-medium text-md">Picked up</p>
                <p className="text-sm text-gray-600">
                  Your package is out for delivery, arriving shortly.
                </p>
              </div>
            </div>
            <div className="border border-[#0000001A] p-4 rounded-lg ">
              <p className="font-semibold text-md">Delivery address</p>

              <div className="mt-2 px-3 py-3 bg-[#F3F5F6] rounded-lg">
                <p className="text-sm text-gray-600">Cairo, Helwan</p>
              </div>
            </div>

            <div className="border border-[#0000001A] p-4 rounded-lg ">
              <p className="font-semibold text-md">Payment method</p>

              <div className="mt-2 px-3 py-3 bg-[#F3F5F6] rounded-lg">
                <p className="text-sm text-gray-600">
                  10% (Pay the 90% on delivery)
                </p>{" "}
              </div>
              <div className="mt-2 px-3 py-3 bg-[#F3F5F6] rounded-lg">
                <p className="text-sm text-gray-600">Cash on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
