"use client";
import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Loader } from "@/components/ui/loader";
import { orderApi, type Order } from "@/services/order.api";

function OrderDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || searchParams.get("id"); // Support both query params
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        // If no orderId, try to get the most recent order
        try {
          const ordersResponse = await orderApi.getUserOrders({ limit: 1 });
          if (ordersResponse.success && ordersResponse.data && ordersResponse.data.length > 0) {
            setOrder(ordersResponse.data[0]);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await orderApi.getById(orderId);
        if (response.success && response.data?.order) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Order not found</p>
          <Link href="/order-history">
            <button className="bg-[#EE8E32] text-white px-6 py-2 rounded-lg hover:bg-[#d67a1f] transition">
              Go to Order History
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; message: string; color: string }> = {
      created: { label: "Created", message: "Your order has been created. Please complete payment.", color: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Paid", message: "Payment received. Your order is being processed.", color: "bg-blue-100 text-blue-800" },
      fulfillment_pending: { label: "Fulfillment Pending", message: "Your order is being prepared for shipment.", color: "bg-purple-100 text-purple-800" },
      shipped: { label: "Shipped", message: "Your package is on the way.", color: "bg-indigo-100 text-indigo-800" },
      delivered: { label: "Delivered", message: "Your package has been delivered.", color: "bg-green-100 text-green-800" },
      closed: { label: "Closed", message: "Order completed successfully.", color: "bg-gray-100 text-gray-800" },
      cancelled: { label: "Cancelled", message: "This order has been cancelled.", color: "bg-red-100 text-red-800" },
    };
    
    return statusMap[status] || { label: status, message: "Order status: " + status, color: "bg-gray-100 text-gray-800" };
  };

  const statusInfo = getStatusDisplay(order.status);
  const totalAmount = parseFloat(order.totalMinor || '0') / 100;
  const subtotal = totalAmount; // For now, assuming no delivery fee in order total
  const deliveryFee = 0; // Can be calculated separately if needed

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      {/* Order Header */}
      <h2 className="text-2xl font-semibold flex gap-3 items-center mb-6">
        Order no.{order.orderNumber}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-6">
          <p className="font-medium text-lg mb-6">Order Items ({order.items?.length || 0})</p>

          {/* Order Items */}
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => {
              const product = item.product;
              const imageUrl = product?.media?.[0]?.url || "/images/cars/car-2.jpg";
              const price = parseFloat(item.priceMinor || '0') / 100;

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center px-4 py-3 rounded-lg mb-4 bg-[#F3F5F6]"
                >
                  <div className="flex items-center gap-6">
                    <Image
                      src={imageUrl}
                      alt={product?.title || "Product"}
                      width={100}
                      height={100}
                      className="object-cover h-[60px] w-[80px] rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-md">{product?.title || "Product"}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-[#EE8E32] text-lg">
                    {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 py-4">No items in this order</p>
          )}

          {/* Payment Summary */}
          <div className="space-y-2 text-gray-700 bg-[#F3F5F6] p-4 rounded-lg mt-6">
            <h2 className="text-lg font-semibold mb-2">Payment Summary</h2>
            
            {/* Auction Order Payment Breakdown */}
            {order.auctionId && order.paymentStage && (
              <>
                {order.downPaymentMinor && parseFloat(order.downPaymentMinor) > 0 && (
                  <div className="flex justify-between text-sm font-normal">
                    <span>Down Payment</span>
                    <span className={order.paymentStage === 'down_payment_required' ? 'font-semibold text-[#EE8E32]' : 'text-gray-500'}>
                      {(parseFloat(order.downPaymentMinor) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                      {order.paymentStage === 'down_payment_required' && ' (Pending)'}
                      {(order.paymentStage === 'final_payment_required' || order.paymentStage === 'fully_paid') && ' (Paid)'}
                    </span>
                  </div>
                )}
                {order.remainingPaymentMinor && parseFloat(order.remainingPaymentMinor) > 0 && (
                  <div className="flex justify-between text-sm font-normal">
                    <span>Final Payment</span>
                    <span className={order.paymentStage === 'final_payment_required' ? 'font-semibold text-[#EE8E32]' : 'text-gray-500'}>
                      {(parseFloat(order.remainingPaymentMinor) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                      {order.paymentStage === 'final_payment_required' && ' (Pending)'}
                      {order.paymentStage === 'fully_paid' && ' (Paid)'}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2"></div>
              </>
            )}
            
            {/* Regular Order Summary */}
            {(!order.auctionId || !order.paymentStage) && (
              <>
                <div className="flex justify-between text-sm font-normal">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm font-normal">
                    <span>Delivery</span>
                    <span>{deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}</span>
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}</span>
            </div>
          </div>
          
          {/* Show payment button for auction orders in payment stages or regular orders in created status */}
          {((order.auctionId && (order.paymentStage === 'down_payment_required' || order.paymentStage === 'final_payment_required' || order.paymentStage === 'full_payment_required')) || 
           (!order.auctionId && order.status === 'created')) && (
            <div className="flex justify-end gap-4 pt-6">
              <Link href="/order-history">
                <button className="text-[#000000] py-3 rounded-lg bg-[#F3F5F6] px-5 cursor-pointer font-semibold hover:bg-gray-200 transition">
                  Back to Orders
                </button>
              </Link>
              {order.shippingAddress && Object.keys(order.shippingAddress).length > 0 ? (
                <Link href={`/payment?type=order&orderId=${order.id}&amount=${order.remainingPayment || order.totalMinor}`}>
                  <button className="bg-[#EE8E32] flex gap-2 items-center text-white py-3 rounded-lg px-5 cursor-pointer font-semibold hover:bg-[#d67a1f] transition">
                    {order.auctionId && order.paymentStage === 'down_payment_required' && 'Pay Down Payment'}
                    {order.auctionId && order.paymentStage === 'final_payment_required' && 'Pay Final Payment'}
                    {order.auctionId && order.paymentStage === 'full_payment_required' && 'Pay Full Payment'}
                    {!order.auctionId && 'Complete Payment'}
                    <IoIosArrowRoundForward color="white" size={20} />
                  </button>
                </Link>
              ) : (
                <Link href={`/address?orderId=${order.id}`}>
                  <button className="bg-[#EE8E32] flex gap-2 items-center text-white py-3 rounded-lg px-5 cursor-pointer font-semibold hover:bg-[#d67a1f] transition">
                    Add Address & Pay
                    <IoIosArrowRoundForward color="white" size={20} />
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-6">
          <div className="space-y-5 text-gray-700 mt-7">
            {/* Order Status */}
            <div className="border border-[#0000001A] p-4 rounded-lg">
              <p className="font-semibold text-md mb-2">Order Status</p>
              <div className={`mt-2 px-3 py-2 rounded-lg ${statusInfo.color}`}>
                <p className="font-medium text-md">{statusInfo.label}</p>
                <p className="text-sm mt-1">{statusInfo.message}</p>
              </div>
            </div>

            {/* Delivery Address */}
            {order.shippingAddress && (
              <div className="border border-[#0000001A] p-4 rounded-lg">
                <p className="font-semibold text-md mb-2">Delivery Address</p>
                <div className="mt-2 px-3 py-3 bg-[#F3F5F6] rounded-lg">
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.street && `${order.shippingAddress.street}, `}
                    {order.shippingAddress.building && `${order.shippingAddress.building}, `}
                    {order.shippingAddress.zone && `Zone ${order.shippingAddress.zone}, `}
                    {order.shippingAddress.city && `${order.shippingAddress.city}, `}
                    {order.shippingAddress.country && order.shippingAddress.country}
                    {order.shippingAddress.phone && `\nPhone: ${order.shippingAddress.phone}`}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="border border-[#0000001A] p-4 rounded-lg">
              <p className="font-semibold text-md mb-2">Payment Method</p>
              <div className="mt-2 px-3 py-3 bg-[#F3F5F6] rounded-lg">
                <p className="text-sm text-gray-600 capitalize">
                  {order.paymentMethod || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Order Date */}
            <div className="border border-[#0000001A] p-4 rounded-lg">
              <p className="font-semibold text-md mb-2">Order Date</p>
              <div className="mt-2 px-3 py-3 bg-[#F3F5F6] rounded-lg">
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderDetailPageContent />
    </Suspense>
  );
}

export default OrderDetailPage;
