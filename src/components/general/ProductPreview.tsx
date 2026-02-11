"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { orderApi } from "@/services/order.api";
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
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.images[0] || "/images/cars/car-1.jpg");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const price = parseFloat(product.priceMinor) / 100;
  const totalPrice = price * quantity;
  const isInStock = product.stock !== undefined && product.stock > 0;
  const isActive = product.status === "active";

  const handleBuyNow = async () => {
    if (!isInStock || !isActive) {
      alert("This product is currently unavailable.");
      return;
    }

    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to purchase items.");
        window.location.href = "/login";
        return;
      }
    }

    setLoading(true);
    try {
      // Get vendor ID (empty for superadmin products - backend will handle it)
      const vendorId = product.vendor?.id || undefined;

      // Create order immediately
      const response = await orderApi.create({
        vendorId, // undefined for superadmin products
        items: [
          {
            productId: product.id,
            quantity: quantity,
          },
        ],
        shippingAddress: {}, // Will be filled on address page
        paymentMethod: "card",
      });

      if (response.success && response.data.order) {
        // Redirect to address page
        router.push(`/address?orderId=${response.data.order.id}`);
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(
        error?.response?.data?.message || "Failed to create order. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
    try {
      const success = await addToCart(product.id, quantity);
      if (success) {
        // Success message is shown by CartContext
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
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
        {/* Similar Products Section - Only for superadmin products */}
        {!product.vendor && (
          <SimilarProductsSection productId={product.id} />
        )}
      </div>
    </div>
  );
};

// Similar Products Section Component for E-commerce
const SimilarProductsSection: React.FC<{ productId: string }> = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const { productApi } = await import('@/services/product.api');
        // Fetch other superadmin e-commerce products (vendorId = null, status = active)
        // Backend expects superadmin_only as query param 'true' or '1'
        const response = await productApi.getAll({
          superadmin_only: true as any, // Will be converted to 'true' string by axios
          status: 'active',
          limit: 4, // Get 4, we'll exclude current and show 3
        });
        
        if (response.success && response.data) {
          // Filter out current product and limit to 3
          const filtered = response.data
            .filter((p: any) => p.id !== productId)
            .slice(0, 3);
          setSimilarProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [productId]);

  const handleProductClick = (productId: string) => {
    if (!productId) {
      console.error('Product ID is missing');
      return;
    }
    window.location.href = `/product-preview?id=${productId}`;
  };

  return (
    <div className="bg-white mx-5 px-5 pt-5 pb-10 rounded-2xl mt-6">
      <h2 className="font-semibold text-xl pb-5">Similar Products</h2>
      
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px] bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : similarProducts.length === 0 ? null : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {similarProducts.map((product) => {
            const price = parseFloat(product.priceMinor || '0') / 100;
            const imageUrl = product.media?.[0]?.url || "/images/cars/car-1.jpg";
            const firstThreeFilters = (product.filterValues || []).slice(0, 3);

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="flex-shrink-0 w-[280px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-full h-48 bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={product.title || "Product"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/cars/car-1.jpg";
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Row 1: Product Name and Price */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm flex-1 truncate">
                      {product.title || "Product"}
                    </h3>
                    <p className="text-lg font-bold text-[#ee8e31] whitespace-nowrap">
                      {price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {product.currency || 'QAR'}
                    </p>
                  </div>
                  
                  {/* Row 2: Stock Status */}
                  {product.stock !== undefined && (
                    <p className={`text-xs mb-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </p>
                  )}
                  
                  {/* Row 3: First Three Filters */}
                  {firstThreeFilters.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                      {firstThreeFilters.map((filterValue: any, index: number) => (
                        <span key={filterValue.id || index} className="truncate">
                          {filterValue.value}
                          {index < firstThreeFilters.length - 1 && <span className="mx-1">•</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductPreview;
