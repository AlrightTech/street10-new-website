"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { orderApi } from "@/services/order.api";
import type { Order } from "@/services/order.api";

interface OrderHistoryItem {
  id: string;
  carName: string;
  date: string;
  price: number;
  image: string;
  orderId: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"order" | "bidding">("order");
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getUserOrders({ limit: 50 });
        const transformedOrders = (response.data || []).map((order: Order) => {
          const total = parseFloat(order.totalMinor) / 100;
          const firstItem = order.items?.[0];
          
          return {
            id: order.orderNumber || `#${order.id.slice(-5)}`,
            carName: firstItem?.product?.title || "BMW",
            date: new Date(order.createdAt).toISOString().split('T')[0],
            price: total,
            image: firstItem?.product?.media?.[0]?.url || "/images/cars/car-1.jpg",
            orderId: order.id,
          };
        });
        setOrders(transformedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Set mock data if API fails
        setOrders([
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-05",
            price: 600,
            image: "/images/cars/car-1.jpg",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50 px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-3 cursor-pointer relative z-50"
            aria-label="Go back"
            type="button"
          >
            <Image
              src="/images/street/back-vector.png"
              alt="Back"
              width={24}
              height={24}
              className="object-contain pointer-events-none"
            />
          </button>
          <h1 className="text-2xl font-bold text-black mb-6">History</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 md:px-6 pb-8 pt-32">
        {/* Tabs */}
        <div className="flex gap-0 mb-6 bg-gray-100 rounded-full p-1 w-fit">
          <button
            onClick={() => setActiveTab("order")}
            className={`px-6 py-2 font-medium transition rounded-full ${
              activeTab === "order"
                ? "bg-[#EE8E32] text-white shadow-md"
                : "text-gray-600 bg-transparent"
            }`}
          >
            Order History
          </button>
          <Link href="/bidding-history">
            <button
              className={`px-6 py-2 font-medium transition rounded-full ${
                activeTab === "bidding"
                  ? "bg-[#EE8E32] text-white shadow-md"
                  : "text-gray-600 bg-transparent"
              }`}
            >
              Bidding History
            </button>
          </Link>
        </div>

        {/* Order History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4"
              >
                {/* Car Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={order.image}
                    alt={order.carName}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Order Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-2">
                    {order.carName}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-500">
                      Order ID: {order.id}
                    </p>
                    <p className="text-gray-500">
                      Date: {order.date}
                    </p>
                    <p className="text-[#EE8E32] font-semibold text-base">
                      QAR {order.price}
                    </p>
                  </div>
                </div>

                {/* View Order Button */}
                <div className="flex-shrink-0">
                  <Link href={`/order-details?id=${order.orderId || index}`}>
                    <button className="bg-[#EE8E32] hover:bg-[#d87a28] text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap">
                      View Order
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

