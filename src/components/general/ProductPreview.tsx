"use client";
import React, { useState } from "react";
import Image from "next/image";
import AboutCar from "./AboutCar";
import CarInfo from "./CarInfo";

interface Product {
  id: string;
  title: string;
  description?: string;
  priceMinor: string;
  currency: string;
  status: string;
  stock?: number;
  images: string[];
  documents?: Array<{
    id: string;
    url: string;
    title: string;
  }>;
  filterValues?: Array<{
    id: string;
    filterId: string;
    value: string;
    filter: {
      id: string;
      key: string;
      type: string;
      iconUrl?: string;
      i18n?: {
        en?: { label: string };
        ar?: { label: string };
      };
    };
  }>;
  vendor?: {
    id: string;
    name?: string;
    email: string;
  };
}

const ProductPreview: React.FC<{ product: Product }> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0] || "/images/cars/car-1.jpg");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const price = parseFloat(product.priceMinor) / 100;
  const totalPrice = price * quantity;
  const isInStock = product.stock !== undefined && product.stock > 0;
  const isActive = product.status === "active";

  const handleBuyNow = async () => {
    // For now, keep the user on this page and do nothing.
    // The actual purchase flow for e-commerce products (superadmin/vendor)
    // will be implemented later.
    if (!isInStock || !isActive) {
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!isInStock || !isActive) {
      alert("This product is currently unavailable.");
      return;
    }

    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add items to cart.");
        window.location.href = "/login";
        return;
      }
    }

    setLoading(true);
    // TODO: Implement actual add to cart functionality
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    alert("Product added to cart!");
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 p-6 rounded-lg items-stretch">
        {/* Left Thumbnails */}
        {product.images.length > 0 && (
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] flex-shrink-0">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className={`min-w-[140px] min-h-[140px] lg:w-28 lg:h-28 cursor-pointer rounded-md overflow-hidden border-2
                  ${
                    selectedImage === img
                      ? "border-[#ee8e31]"
                      : "border-transparent"
                  }`}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img}
                  alt={`Product ${idx + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Main Preview */}
        <div className="flex-1 rounded-lg overflow-hidden shadow flex items-center justify-center bg-white h-110">
          <Image
            src={selectedImage}
            alt={product.title}
            width={600}
            height={500}
            className="w-full h-110 object-cover"
          />
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-[650px] flex flex-col justify-between p-6">
          <div>
            <h2 className="text-lg lg:text-2xl font-semibold mb-2">
              {product.title}
              <span
                className={`text-sm font-medium ms-4 ${
                  isInStock && isActive
                    ? "text-[#038001]"
                    : "text-red-600"
                }`}
              >
                <span className="text-xl">●</span>{" "}
                {isInStock && isActive
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </span>
            </h2>

            <div className="my-6">
              <p className="text-3xl font-bold text-[#ee8e31] mb-2">
                {totalPrice.toLocaleString()} {product.currency}
              </p>
              {quantity > 1 && (
                <p className="text-sm text-gray-500">
                  {price.toLocaleString()} {product.currency} × {quantity}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            {isInStock && isActive && (
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center gap-2 border rounded-lg p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-lg font-semibold text-[#ee8e31] hover:bg-gray-100 rounded"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                    className="px-3 py-1 text-lg font-semibold text-[#ee8e31] hover:bg-gray-100 rounded"
                    disabled={quantity >= (product.stock || 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleBuyNow}
                disabled={!isInStock || !isActive || loading}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                  isInStock && isActive
                    ? "bg-[#ee8e31] hover:bg-[#d67d28]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Processing..." : "Buy Now"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || !isActive || loading}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold border-2 transition-colors ${
                  isInStock && isActive
                    ? "border-[#ee8e31] text-[#ee8e31] hover:bg-[#ee8e31] hover:text-white"
                    : "border-gray-400 text-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Adding..." : "Add to Cart"}
              </button>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sold by</p>
                <p className="text-base font-semibold text-gray-800">
                  {product.vendor.name || product.vendor.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="px-6 pb-6">
        <CarInfo
          description={product.description || ""}
          documents={product.documents || []}
        />
        {product.filterValues && product.filterValues.length > 0 && (
          <AboutCar filterValues={product.filterValues} />
        )}
      </div>
    </div>
  );
};

export default ProductPreview;
