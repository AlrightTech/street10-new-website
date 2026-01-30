"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/services/order.api";
import type { Order } from "@/services/order.api";
import { Loader } from "@/components/ui/loader";
import { IoIosArrowRoundForward } from "react-icons/io";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartOrders = async () => {
      try {
        setLoading(true);
        // Fetch orders with status 'created' (won auction orders pending checkout)
        const response = await orderApi.getUserOrders({ status: 'created', limit: 50 });
        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching cart orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartOrders();
  }, []);

  const handleProceedToCheckout = (orderId: string) => {
    // Navigate to address page with order ID
    router.push(`/address?orderId=${orderId}`);
  };

  const totalAmount = orders.reduce((sum, order) => {
    return sum + parseFloat(order.totalMinor || '0') / 100;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <p className="text-gray-500 mb-6">You don't have any won auction items to checkout.</p>
            <Link
              href="/bidding"
              className="inline-flex items-center gap-2 bg-[#EE8E32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition"
            >
              Browse Auctions
              <IoIosArrowRoundForward size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
        <p className="text-gray-600 mb-6">
          Congratulations! You won these auctions. Please complete checkout to finalize your purchase.
        </p>

        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            const product = firstItem?.product;
            const imageUrl = product?.media?.[0]?.url || "/images/cars/car-1.jpg";
            const total = parseFloat(order.totalMinor || '0') / 100;

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={product?.title || "Product"}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {product?.title || "Auction Item"}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Order Number: <span className="font-medium">{order.orderNumber}</span>
                    </p>
                    <p className="text-gray-600 mb-4">
                      Status: <span className="font-medium capitalize">{order.status}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-[#EE8E32]">
                          {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.items?.length || 1} item(s)
                        </p>
                      </div>
                      <button
                        onClick={() => handleProceedToCheckout(order.id)}
                        className="bg-[#EE8E32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition flex items-center gap-2"
                      >
                        Proceed to Checkout
                        <IoIosArrowRoundForward size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {orders.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Total Items</span>
                <span>{orders.length}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total Amount</span>
                <span className="text-[#EE8E32]">
                  {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
