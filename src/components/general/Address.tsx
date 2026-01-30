"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineArrowDownward } from "react-icons/md";
import { Loader } from "../ui/loader";
import { orderApi } from "@/services/order.api";
import type { Order, ShippingAddress } from "@/services/order.api";

const Address = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [fetchingOrder, setFetchingOrder] = useState(true);
  const [formData, setFormData] = useState<ShippingAddress>({
    country: "",
    city: "",
    zone: "",
    street: "",
    building: "",
    homeOffice: "",
    phone: "",
    instructions: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setFetchingOrder(true);
        
        if (orderId) {
          // Fetch specific order by ID
          const response = await orderApi.getById(orderId);
          if (response.success && response.data?.order) {
            setOrder(response.data.order);
            // Pre-fill form with existing address if available
            if (response.data.order.shippingAddress) {
              setFormData({
                ...response.data.order.shippingAddress,
                ...formData,
              });
            }
          }
        } else {
          // No orderId provided - fetch user's pending orders (won auctions)
          try {
            const ordersResponse = await orderApi.getUserOrders({ status: 'created' });
            // API returns data as array directly (PaginatedResponse format)
            const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];
            if (orders.length > 0) {
              // Use the first pending order (most recent won auction)
              const pendingOrder = orders[0];
              setOrder(pendingOrder);
              // Pre-fill form with existing address if available
              if (pendingOrder.shippingAddress) {
                setFormData({
                  ...pendingOrder.shippingAddress,
                  ...formData,
                });
              }
            } else {
              // No pending orders - show message
              console.log('No pending orders found');
            }
          } catch (error) {
            console.error('Error fetching pending orders:', error);
            // Don't show alert - user might not have won any auctions yet
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        // Don't show alert if no order found (user might not have won any auctions)
        if (orderId) {
          alert("Failed to load order. Please try again.");
        }
      } finally {
        setFetchingOrder(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSubmit = async () => {
    const targetOrderId = orderId || order?.id;
    if (!targetOrderId) {
      alert("Order ID is missing. Please go back to cart.");
      return;
    }

    // Validate required fields
    if (!formData.country || !formData.city || !formData.street) {
      alert("Please fill in all required fields (Country, City, Street).");
      return;
    }

    setLoading(true);
    try {
      await orderApi.updateAddress(targetOrderId, formData);
      
      // Fetch order again to get updated remaining payment amount
      const updatedOrderResponse = await orderApi.getById(targetOrderId);
      const updatedOrder = updatedOrderResponse.data?.order;
      
      // Calculate remaining payment: final price - deposit
      // Deposit is already held in onHoldMinor and will be applied to order
      // User needs to pay the remaining amount
      const remainingAmount = updatedOrder?.remainingPayment || updatedOrder?.totalMinor || order?.totalMinor || '0';
      
      // Redirect to payment page with orderId and remaining amount
      router.push(`/payment?type=order&orderId=${targetOrderId}&amount=${remainingAmount}`);
    } catch (error: any) {
      console.error("Error updating address:", error);
      alert(error?.response?.data?.message || "Failed to update address. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <select
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 pr-10 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31] appearance-none"
              >
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
              <select
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 pr-10 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31] appearance-none"
              >
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
                value={formData.zone || ""}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
              <input
                type="text"
                placeholder="Street Number"
                value={formData.street || ""}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
            </div>

            {/* Building + Home/Office */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Building Number"
                value={formData.building || ""}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
              <input
                type="text"
                placeholder="Home / Office Number"
                value={formData.homeOffice || ""}
                onChange={(e) => setFormData({ ...formData, homeOffice: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
              />
            </div>

            {/* Phone */}
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white rounded-md border focus:outline-none focus:ring-2 focus:ring-[#ee8e31]"
            />

            {/* Extra Instructions */}
            <textarea
              placeholder="Extra instructions (ex. special landmarks)"
              value={formData.instructions || ""}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
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
                onClick={handleSubmit}
                disabled={loading || !order}
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
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

          {fetchingOrder ? (
            <div className="flex items-center justify-center py-8">
              <Loader size="md" />
            </div>
          ) : order ? (
            <>
              {/* Order Item */}
              {order.items?.map((item) => {
                const product = item.product;
                const imageUrl = product?.media?.[0]?.url || "/images/cars/car-1.jpg";
                const price = parseFloat(item.priceMinor || '0') / 100;

                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg mb-4 bg-[#F3F5F6]">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={product?.title || "Product"}
                        width={80}
                        height={80}
                        className="object-cover h-20 w-20 rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{product?.title || "Product"}</p>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#EE8E32]">
                        {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Summary */}
              <div className="space-y-2 text-gray-700 bg-[#F3F5F6] p-4 rounded-lg">
                <h2 className="text-lg font-semibold">Payment Summary</h2>
                <div className="flex justify-between font-normal">
                  <span>Subtotal</span>
                  <span>{(parseFloat(order.totalMinor || '0') / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#EE8E32]">
                    {(parseFloat(order.totalMinor || '0') / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                  </span>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="mt-4 bg-[#F3F5F6] p-4 rounded-lg">
                <p className="text-lg font-semibold">Expected Delivery:</p>
                <p className="font-normal">
                  Our team will contact you in the next 24 hours
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No order found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
