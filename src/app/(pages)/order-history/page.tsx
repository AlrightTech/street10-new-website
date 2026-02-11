"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/services/order.api";
import type { Order } from "@/services/order.api";

interface OrderHistoryItem {
  id: string;
  carName: string;
  date: string;
  price: number;
  image: string;
  orderId: string;
  status: string;
  auctionId?: string;
  paymentStage?: string;
  shippingAddress?: any;
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
          
          // For auction orders, use paymentStage for display status, otherwise use order.status
          let displayStatus = order.status || 'created';
          if (order.auctionId && order.paymentStage) {
            // Map payment stage to user-friendly status
            switch (order.paymentStage) {
              case 'down_payment_required':
                displayStatus = 'Down Payment Required';
                break;
              case 'final_payment_required':
                displayStatus = 'Final Payment Required';
                break;
              case 'full_payment_required':
                displayStatus = 'Full Payment Required';
                break;
              case 'fully_paid':
                displayStatus = 'Fully Paid';
                break;
              case 'settlement_missed':
                displayStatus = 'Settlement Missed';
                break;
              default:
                // If paymentStage exists but not recognized, check order.status
                if (order.status === 'down_payment_paid') {
                  displayStatus = 'Down Payment Paid - Final Payment Required';
                } else {
                  displayStatus = order.status || 'created';
                }
            }
          } else if (order.auctionId && order.status === 'down_payment_paid') {
            // Handle case where paymentStage might not be set yet but status is updated
            displayStatus = 'Down Payment Paid - Final Payment Required';
          }
          
          return {
            id: order.orderNumber || `#${order.id.slice(-5)}`,
            carName: firstItem?.product?.title || "BMW",
            date: new Date(order.createdAt).toISOString().split('T')[0],
            price: total,
            image: firstItem?.product?.media?.[0]?.url || "/images/cars/car-1.jpg",
            orderId: order.id,
            status: displayStatus,
            // Include auction order fields for payment button logic
            auctionId: order.auctionId,
            paymentStage: order.paymentStage,
            shippingAddress: order.shippingAddress,
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
            orderId: "order-12345-1",
            status: "created",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
            orderId: "order-12345-2",
            status: "created",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
            orderId: "order-12345-3",
            status: "created",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
            orderId: "order-12345-4",
            status: "created",
          },
          {
            id: "#12345",
            carName: "BMW",
            date: "2023-10-06",
            price: 600,
            image: "/images/cars/car-1.jpg",
            orderId: "order-12345-5",
            status: "created",
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
          <button
            onClick={() => {
              // Use full-page navigation for immediate response
              window.location.href = "/bidding-history";
            }}
            className={`px-6 py-2 font-medium transition rounded-full ${
              activeTab === "bidding"
                ? "bg-[#EE8E32] text-white shadow-md"
                : "text-gray-600 bg-transparent"
            }`}
          >
            Bidding History
          </button>
        </div>

        {/* Order History Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={order.image}
                            alt={order.carName}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <span className="font-semibold text-black">{order.carName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {order.id}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {order.date}
                      </td>
                      <td className="px-4 py-4">
                        <span className="capitalize text-gray-700">{order.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-[#EE8E32] font-semibold">
                          QAR {order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              window.location.href = `/order-preview?orderId=${order.orderId}`;
                            }}
                            className="bg-[#EE8E32] hover:bg-[#d87a28] text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm"
                          >
                            View Order
                          </button>
                          {/* Show checkout button for auction orders that need payment */}
                          {order.auctionId && 
                           (order.paymentStage === 'down_payment_required' || 
                            order.paymentStage === 'final_payment_required' || 
                            order.paymentStage === 'full_payment_required') && 
                           order.shippingAddress && 
                           Object.keys(order.shippingAddress).length > 0 && (
                            <button
                              onClick={() => {
                                window.location.href = `/payment?type=order&orderId=${order.orderId}`;
                              }}
                              className="bg-[#4C50A2] hover:bg-[#3d4080] text-white px-4 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm"
                            >
                              {order.paymentStage === 'down_payment_required' && 'Pay Down Payment'}
                              {order.paymentStage === 'final_payment_required' && 'Pay Final Payment'}
                              {order.paymentStage === 'full_payment_required' && 'Pay Full Payment'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

