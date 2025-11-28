"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PiClockCounterClockwise } from "react-icons/pi";
import { orderApi } from "@/services/order.api";
import type { Order } from "@/services/order.api";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getUserOrders({ limit: 50 });
        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching user orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Transform order data to match the format
  const transformedOrders = orders.map((order) => {
    const total = parseFloat(order.totalMinor) / 100;
    const firstItem = order.items?.[0];
    const itemCount = order.items?.length || 0;
    
    return {
      id: parseInt(order.orderNumber.replace(/[^0-9]/g, "").substring(0, 6)) || 0,
      status: order.status === "delivered" ? "Delivered" : 
              order.status === "cancelled" ? "Cancelled" : 
              "Pending",
      price: `QAR ${total.toLocaleString()}`,
      date: new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      title: firstItem?.product?.title || "Order Items",
      desc: firstItem?.product?.title || "Order description",
      items: `${itemCount} ${itemCount === 1 ? "Item" : "Items"}`,
      img: firstItem?.product?.media?.[0]?.url || "/images/cars/car-1.jpg",
    };
  });

  return (
    <div className="px-4 md:px-8 pt-6 pb-25 bg-gray-100 min-h-screen">
      <h2 className="text-2xl flex items-center gap-3 font-semibold mb-6">
        <PiClockCounterClockwise /> Order History
      </h2>

      {/* ✅ Responsive Table Wrapper */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-[700px] w-full text-left">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-5 text-nowrap text-sm md:text-base font-semibold text-[#666666]">
                Order Items
              </th>
              <th className="px-4 py-5 text-nowrap text-sm md:text-base font-semibold text-[#666666] text-center">
                Order Id
              </th>
              <th className="px-4 py-5 text-nowrap text-sm md:text-base font-semibold text-[#666666] text-center">
                Status
              </th>
              <th className="px-4 py-5 text-nowrap text-sm md:text-base font-semibold text-[#666666] text-center">
                Price
              </th>
              <th className="px-4 py-5 text-nowrap text-sm md:text-base font-semibold text-[#666666] text-center">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="text-gray-500">Loading orders...</p>
                </td>
              </tr>
            ) : transformedOrders.length > 0 ? (
              transformedOrders.map((order, i) => (
                <tr key={order.id || i} className="even:bg-white odd:bg-gray-50">
                {/* Order Item */}
                <td className="px-4 py-5">
                  <div className="flex gap-3 items-center">
                    <Image
                      src={order.img}
                      alt={order.title}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="min-w-[180px]">
                      <p className="text-sm font-medium text-gray-900">
                        {order.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {order.desc}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {order.items}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Order Id */}
                <td className="px-4 py-3 text-center text-sm md:text-base">
                  {order.id}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium w-fit mx-auto block
                      ${
                        order.status === "Delivered"
                          ? "text-green-700 bg-green-100"
                          : order.status === "Pending"
                          ? "text-yellow-700 bg-yellow-100"
                          : "text-red-700 bg-red-100"
                      }
                    `}
                  >
                    {order.status}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-center text-sm md:text-base">
                  {order.price}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-center text-sm md:text-base">
                  {order.date}
                </td>
              </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="text-gray-500">No orders found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
