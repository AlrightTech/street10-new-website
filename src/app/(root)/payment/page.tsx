"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Loader } from "@/components/ui/loader";

function PaymentPage() {
  const [selectedPayment, setSelectedPayment] = useState("new-card");
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cvv: "",
    expiry: "",
    cardHolder: "",
  });

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    // Navigation will happen via Link
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-semibold mb-6">Choose your payment method</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section - Payment Methods */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-6">
          {/* PayPal Option */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg mb-4 cursor-pointer border-2 transition ${
              selectedPayment === "paypal"
                ? "border-[#ee8e31] bg-[#fdf4eb]"
                : "border-gray-200 bg-[#fdf4eb]"
            }`}
            onClick={() => setSelectedPayment("paypal")}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === "paypal"
                    ? "border-[#ee8e31] bg-[#ee8e31]"
                    : "border-[#ee8e31]"
                }`}
              >
                {selectedPayment === "paypal" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <p className="font-semibold text-md">Paypal</p>
                <p className="text-sm text-gray-600">
                  Safe payment online. Credit card needed. Paypal account is not
                  necessary.
                </p>
              </div>
            </div>
            <Image
              src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
              alt="PayPal"
              width={80}
              height={50}
              className="object-contain"
            />
          </div>

          {/* Saved Credit Card Option */}
          <div
            className={`flex items-center justify-between p-4 rounded-lg mb-4 cursor-pointer border-2 transition ${
              selectedPayment === "saved-card"
                ? "border-[#ee8e31] bg-[#fdf4eb]"
                : "border-gray-200 bg-[#fdf4eb]"
            }`}
            onClick={() => setSelectedPayment("saved-card")}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === "saved-card"
                    ? "border-[#ee8e31] bg-[#ee8e31]"
                    : "border-[#ee8e31]"
                }`}
              >
                {selectedPayment === "saved-card" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div>
                <p className="font-semibold text-md">Saved credit card (***2837)</p>
                <p className="text-sm text-gray-600">
                  Easily select from your saved and verified cards on our system.
                  You will need just your cvv no.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/772px-Mastercard-logo.svg.png"
                alt="MasterCard"
                width={40}
                height={30}
                className="object-contain"
              />
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/800px-Visa_Inc._logo.svg.png"
                alt="Visa"
                width={40}
                height={30}
                className="object-contain"
              />
            </div>
          </div>

          {/* New Credit Card Option */}
          <div
            className={`p-4 rounded-lg mb-4 cursor-pointer border-2 transition ${
              selectedPayment === "new-card"
                ? "border-[#ee8e31] bg-[#fdf4eb]"
                : "border-gray-200 bg-[#fdf4eb]"
            }`}
            onClick={() => setSelectedPayment("new-card")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === "new-card"
                      ? "border-[#ee8e31] bg-[#ee8e31]"
                      : "border-[#ee8e31]"
                  }`}
                >
                  {selectedPayment === "new-card" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-md">New credit card</p>
                  <p className="text-sm text-gray-600">
                    Safe money transfer using your bank account, visa, maestro.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/772px-Mastercard-logo.svg.png"
                  alt="MasterCard"
                  width={40}
                  height={30}
                  className="object-contain"
                />
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/800px-Visa_Inc._logo.svg.png"
                  alt="Visa"
                  width={40}
                  height={30}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Card Form - Only show when new-card is selected */}
            {selectedPayment === "new-card" && (
              <div className="space-y-4 mt-4 pl-9">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "");
                      const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                      setCardData({ ...cardData, cardNumber: formatted });
                    }}
                    className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter 3 digit
                    </label>
                    <input
                      type="text"
                      placeholder="CVV"
                      maxLength={3}
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cvv: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MM/YY
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4);
                        }
                        setCardData({ ...cardData, expiry: value });
                      }}
                      className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter the name of the card
                  </label>
                  <input
                    type="text"
                    placeholder="Card Holder Name"
                    value={cardData.cardHolder}
                    onChange={(e) =>
                      setCardData({ ...cardData, cardHolder: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Link href="/order-preview">
              <button className="text-[#000000] py-3 rounded-lg bg-[#F3F5F6] px-5 cursor-pointer font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
            </Link>
            <Link href="/order-history" onClick={handleCheckout}>
              <button
                disabled={loading}
                className="bg-[#EE8E32] flex gap-2 items-center justify-center text-white py-3 rounded-lg px-5 cursor-pointer font-semibold hover:bg-[#d67a1f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader size="sm" color="#ffffff" />
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout
                    <IoIosArrowRoundForward color="white" size={20} />
                  </>
                )}
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section - Payment Summary */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>QAR 1800</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span>QAR 50</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
              <span>Total</span>
              <span>QAR 1850</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

