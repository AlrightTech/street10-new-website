"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineArrowDownward } from "react-icons/md";
import Link from "next/link";
import { Loader } from "../ui/loader";

const Address = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    // Navigation will happen via Link
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-semibold flex gap-3 items-center mb-6">
        {" "}
        <IoLocationOutline />
        Select Address
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section - Map + Form */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-4">
          {/* Google Map */}
          <div className="w-full h-100 rounded-lg overflow-hidden mb-6">
            <iframe
              title="Google Map - Saudi Arabia"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10852989.518857069!2d36.66439!3d23.885942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x155e08d88aa45ed9%3A0x74fb2e5a1b49faba!2sSaudi%20Arabia!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-[#666666]">
            {/* Country */}

            <div className="relative w-full">
              <select className="w-full px-4 py-3 pr-10 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31] appearance-none">
                <option value="">Select Country</option>
                <option value="pakistan">Pakistan</option>
                <option value="uae">UAE</option>
                <option value="qatar">Qatar</option>
              </select>
              {/* Custom Icon */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <MdKeyboardArrowDown size={25} />
              </span>
            </div>

            {/* City */}
            <div className="relative w-full">
              <select className="w-full px-4 py-3 pr-10 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31] appearance-none">
                <option value="">Select City</option>
                <option value="lahore">Lahore</option>
                <option value="karachi">Karachi</option>
                <option value="doha">Doha</option>
              </select>
              {/* Custom Icon */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <MdKeyboardArrowDown size={25} />
              </span>
            </div>

            {/* Zone + Street */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Zone Number"
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
              <input
                type="text"
                placeholder="Street Number"
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
            </div>

            {/* Building + Home/Office */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Building Number"
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
              <input
                type="text"
                placeholder="Home / Office Number"
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
            </div>

            {/* Phone */}
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
            />

            {/* Extra Instructions */}
            <textarea
              placeholder="Extra instructions (ex. special landmarks)"
              className="w-full px-4 py-2 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              rows={3}
            ></textarea>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => router.push("/e-commerce")}
                className="text-[#000000] py-3 rounded-lg bg-[#F3F5F6] px-5 cursor-pointer font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleSubmit();
                  router.push("/order-preview");
                }}
                disabled={loading}
                className="bg-[#EE8E32] flex gap-2 items-center justify-center text-white py-3 rounded-lg px-5 cursor-pointer font-semibold hover:bg-[#d67a1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading ? (
                    <>
                      <Loader size="sm" color="#ffffff" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit & Pay
                      <MdOutlineArrowDownward color="white" size={20} />
                    </>
                  )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Cart Details */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-4">
          <h3 className="text-xl font-semibold mb-4">Your Cart</h3>

          {/* Cart Item */}
          <div className="flex items-center gap-4  p-4 rounded-lg mb-4 bg-[#F3F5F6]">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <Image
                src={"/images/cars/car-1.jpg"}
                alt="car"
                width={100}
                height={100}
                className="object-cover h-20 w-20 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Car GTR 503</p>
              <div className="flex items-center gap-3 mt-2 bg-white px-4 py-3 rounded-lg w-30">
                <FaMinus className="cursor-pointer text-[#EE8E32]" />
                <span className="px-2 text-[#EE8E32] text-xl font-semibold">
                  1
                </span>
                <FaPlus className="cursor-pointer text-[#EE8E32]" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#EE8E32]">QAR 1200</p>
              <FaTrash className="text-[#EE8E32] cursor-pointer mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-4  p-4 rounded-lg mb-4 bg-[#F3F5F6]">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <Image
                src={"/images/cars/car-1.jpg"}
                alt="car"
                width={100}
                height={100}
                className="object-cover h-20 w-20 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Car GTR 503</p>
              <div className="flex items-center gap-3 mt-2 bg-white px-4 py-3 rounded-lg w-30">
                <FaMinus className="cursor-pointer text-[#EE8E32]" />
                <span className="px-2 text-[#EE8E32] text-xl font-semibold">
                  1
                </span>
                <FaPlus className="cursor-pointer text-[#EE8E32]" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#EE8E32]">QAR 1200</p>
              <FaTrash className="text-[#EE8E32] cursor-pointer mt-2" />
            </div>
          </div>
          <div className="flex items-center gap-4  p-4 rounded-lg mb-4 bg-[#F3F5F6]">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
              <Image
                src={"/images/cars/car-1.jpg"}
                alt="car"
                width={100}
                height={100}
                className="object-cover h-20 w-20 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Car GTR 503</p>
              <div className="flex items-center gap-3 mt-2 bg-white px-4 py-3 rounded-lg w-30">
                <FaMinus className="cursor-pointer text-[#EE8E32]" />
                <span className="px-2 text-[#EE8E32] text-xl font-semibold">
                  1
                </span>
                <FaPlus className="cursor-pointer text-[#EE8E32]" />
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#EE8E32]">QAR 1200</p>
              <FaTrash className="text-[#EE8E32] cursor-pointer mt-2" />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2 text-gray-700 bg-[#F3F5F6] p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Payment Summary</h2>
            <div className="flex justify-between font-normal">
              <span>Subtotal</span>
              <span>QAR 1200</span>
            </div>
            <div className="flex justify-between font-normal">
              <span>Delivery</span>
              <span>QAR 50</span>
            </div>
            <div className="flex justify-between  font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>QAR 1250</span>
            </div>
          </div>

          {/* Delivery Date */}
          <div className="mt-4 bg-[#F3F5F6] p-4 rounded-lg">
            <p className="text-lg font-semibold">Expected Delivery:</p>
            <p className="font-normal">
              Our team will contact you in the next 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
