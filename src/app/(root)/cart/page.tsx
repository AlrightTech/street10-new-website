"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { Loader } from "@/components/ui/loader";
import { IoIosArrowRoundForward } from "react-icons/io";
import { FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import { orderApi } from "@/services/order.api";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, updateCartItem, removeCartItem, refreshCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  // Select all items by default when cart loads
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      setSelectedItems(new Set(cart.items.map((item) => item.id)));
    }
  }, [cart]);

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (!cart) return;
    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.items.map((item) => item.id)));
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      alert("Please select at least one item to checkout");
      return;
    }

    if (!cart) return;

    setProcessing(true);
    try {
      // Get selected cart items
      const selectedCartItems = cart.items.filter((item) =>
        selectedItems.has(item.id)
      );

      if (selectedCartItems.length === 0) {
        alert("Please select at least one item to checkout");
        setProcessing(false);
        return;
      }

      // Group items by vendor
      const itemsByVendor = new Map<string, typeof selectedCartItems>();
      selectedCartItems.forEach((item) => {
        const vendorId = item.product.vendor?.id || ""; // Empty string for superadmin products
        if (!itemsByVendor.has(vendorId)) {
          itemsByVendor.set(vendorId, []);
        }
        itemsByVendor.get(vendorId)!.push(item);
      });

      // For now, handle single vendor checkout (can be extended for multi-vendor)
      const vendorId = Array.from(itemsByVendor.keys())[0];
      const vendorItems = itemsByVendor.get(vendorId)!;

      // Create order from selected cart items
      // vendorId can be empty string for superadmin products - backend will handle it
      const orderData = {
        vendorId: vendorId || undefined, // Send undefined if empty (superadmin products)
        items: vendorItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {}, // Will be filled on address page
        paymentMethod: "card",
      };

      const response = await orderApi.create(orderData);

      if (response.success && response.data.order) {
        // Remove selected items from cart
        for (const itemId of selectedItems) {
          try {
            await removeCartItem(itemId);
          } catch (error) {
            console.error("Error removing cart item:", error);
          }
        }

        // Redirect to address page
        router.push(`/address?orderId=${response.data.order.id}`);
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(
        error?.response?.data?.message || "Failed to create order. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  // Calculate totals for selected items
  const calculateTotals = () => {
    if (!cart) return { subtotal: 0, delivery: 0, total: 0 };

    const selectedCartItems = cart.items.filter((item) =>
      selectedItems.has(item.id)
    );

    const subtotal = selectedCartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.priceMinor) / 100;
      return sum + price * item.quantity;
    }, 0);

    const delivery = 0; // Delivery fee can be added later
    const total = subtotal + delivery;

    return { subtotal, delivery, total };
  };

  const { subtotal, delivery, total } = calculateTotals();

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <p className="text-gray-500 mb-6">
              You don't have any items in your cart.
            </p>
            <Link
              href="/e-commerce"
              className="inline-flex items-center gap-2 bg-[#EE8E32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition"
            >
              Continue Shopping
              <IoIosArrowRoundForward size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const price = parseFloat(item.product.priceMinor) / 100;
              const itemTotal = price * item.quantity;
              const isSelected = selectedItems.has(item.id);
              const imageUrl =
                item.product.media?.[0]?.url || "/images/cars/car-1.jpg";
              const isInStock =
                item.product.stock !== undefined && item.product.stock > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md p-4 md:p-6"
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-5 h-5 text-[#ee8e31] border-gray-300 rounded focus:ring-[#ee8e31] cursor-pointer"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.product.title}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 truncate">
                        {item.product.title}
                      </h3>
                      {item.product.stock !== undefined && (
                        <p
                          className={`text-sm mb-2 ${
                            isInStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isInStock
                            ? `${item.product.stock} piece available`
                            : "Out of stock"}
                        </p>
                      )}

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 border rounded-lg p-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-lg font-semibold text-[#ee8e31] hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-base font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.product.stock !== undefined &&
                              item.quantity >= item.product.stock
                            }
                            className="px-2 py-1 text-lg font-semibold text-[#ee8e31] hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-4 ml-auto">
                          <p className="text-lg font-semibold text-[#ee8e31]">
                            {itemTotal.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            {item.product.currency}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>
                    {subtotal.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    QAR
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span>
                    {delivery.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    QAR
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-[#EE8E32]">
                    {total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    QAR
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0 || processing}
                className="w-full bg-[#EE8E32] text-white py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader size="sm" color="#ffffff" />
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout
                    <IoIosArrowRoundForward size={20} />
                  </>
                )}
              </button>

              {/* Expected Delivery */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Expected delivery date
                </h4>
                <p className="text-sm text-gray-600">
                  Our team will contact you in the next 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
