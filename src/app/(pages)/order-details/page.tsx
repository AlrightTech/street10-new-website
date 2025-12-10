"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { orderApi } from "@/services/order.api";
import type { Order } from "@/services/order.api";

interface OrderDetailsDisplay {
  id: string;
  carName: string;
  date: string;
  price: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  image: string;
  deliveryAddress: string;
  cardNumber?: string;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  
  const [order, setOrder] = useState<OrderDetailsDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        if (orderId) {
          // TODO: Replace with actual API call
          // const response = await orderApi.getOrderById(orderId);
          // setOrder(response.data);
          
          // Mock data for now
          setOrder({
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            subtotal: 300,
            deliveryFee: 200,
            total: 500,
            image: "/images/cars/car-1.jpg",
            deliveryAddress: "Cario helwan",
            cardNumber: "*273",
          });
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-100">
      {/* Background decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 right-0 w-3/4 h-64 bg-purple-100 rounded-bl-[50%] opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-2/3 h-48 bg-gray-200 rounded-tr-[50%] opacity-30"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-10 px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-3"
            aria-label="Go back"
          >
            <Image
              src="/images/street/back-vector.png"
              alt="Back"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl px-4 md:px-6 pb-8 pt-16 space-y-4">
        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-4">Order Details</h2>
          <div className="flex items-center gap-4">
            <Image
              src={order.image}
              alt={order.carName}
              width={100}
              height={100}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-black mb-2">{order.carName}</h3>
              <p className="text-sm text-gray-500 mb-1">Order ID: {order.id}</p>
              <p className="text-sm text-gray-500 mb-2">Date: {order.date}</p>
              <p className="text-lg font-bold text-black">QAR {order.price}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-4">Delivery Address</h2>
          <input
            type="text"
            value={order.deliveryAddress}
            readOnly
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-black"
          />
        </div>

        {/* Expected Delivery Date Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-2">Expected Delivery date</h2>
          <p className="text-gray-700">Our team will contact you in 24 hours</p>
        </div>

        {/* Payment Method Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-4">Payment method</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer bg-gray-100 rounded-lg px-4 py-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "card" 
                    ? "border-[#EE8E32] bg-[#EE8E32]" 
                    : "border-gray-300 bg-gray-200"
                }`}>
                  {paymentMethod === "card" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-black">
                Visa/Credit Card ({order.cardNumber || "*273"})
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer bg-gray-100 rounded-lg px-4 py-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === "cash" 
                    ? "border-[#EE8E32] bg-[#EE8E32]" 
                    : "border-gray-300 bg-gray-200"
                }`}>
                  {paymentMethod === "cash" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <span className="text-black">Cash on Delivery</span>
            </label>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-black mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Sub total</span>
              <span className="text-gray-700">QAR {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Delivery fee</span>
              <span className="text-gray-700">QAR {order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-lg font-bold text-black">Total</span>
              <span className="text-lg font-bold text-black">QAR {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

