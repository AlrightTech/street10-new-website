"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { vendorApi } from "@/services/vendor.api";
import { productApi } from "@/services/product.api";
import type { Vendor } from "@/services/vendor.api";
import type { Product } from "@/services/product.api";

function VendorStorePage() {
  const params = useParams();
  const vendorId = params?.id as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about' | 'policies'>('products');

  useEffect(() => {
    const fetchData = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        const [vendorResponse, productsResponse] = await Promise.all([
          vendorApi.getById(vendorId),
          productApi.getAll({ vendor_id: vendorId, status: 'active', limit: 50 }),
        ]);
        
        setVendor(vendorResponse.data.vendor);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error("Error fetching vendor store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F7941D] border-r-transparent"></div>
          <p className="mt-4 text-lg font-semibold text-gray-900">Loading vendor store...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Vendor not found</p>
        </div>
      </div>
    );
  }

  const companyDocs = (vendor as any).companyDocs as any;
  const vendorCategory = companyDocs?.businessDetails?.category || "General";
  const vendorDescription = companyDocs?.businessDetails?.description || "Your trusted vendor";
  const vendorLogo = (vendor as any).profileImageUrl || "/icons/honda.svg";
  const vendorBanner = companyDocs?.businessDetails?.bannerImage || "/images/vendor-banner.jpg";
  // These values will be calculated from actual data when review/order systems are fully implemented
  // For now, using default values that can be updated when those features are available
  const rating = 4.8; // Will be calculated from reviews when review system is implemented
  const reviewCount = 324; // Will be fetched from reviews API when available
  const location = companyDocs?.businessDetails?.location || "Location not specified";
  const memberSince = new Date(vendor.createdAt).getFullYear();

  const productCount = products.length;
  const totalOrders = "2.5K+"; // Will be calculated from orders when order tracking is implemented
  const responseTime = "2h"; // Will be calculated from vendor response data when available

  return (
    <div className="bg-[#f4f5f6] min-h-screen pb-14">
      {/* Vendor Banner and Profile */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image
          src={vendorBanner}
          alt={`${vendor.name} banner`}
          width={1200}
          height={400}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/vendor-banner.jpg";
          }}
        />
        {/* Vendor Profile Card Overlay */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-6xl px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Vendor Logo */}
            <div className="w-24 h-24 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={vendorLogo}
                alt={vendor.name}
                width={96}
                height={96}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/icons/honda.svg";
                }}
              />
            </div>
            
            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {vendorCategory}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{rating} ({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Vendor Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Vendor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About Vendor</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{vendorDescription}</p>
            </div>

            {/* Vendor Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm text-gray-600">Total Products</span>
                  </div>
                  <span className="font-semibold text-gray-900">{productCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Total Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">{totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">Avg. Rating</span>
                  </div>
                  <span className="font-semibold text-gray-900">{rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">Response Time</span>
                  </div>
                  <span className="font-semibold text-gray-900">{responseTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Products */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                {(['products', 'reviews', 'about', 'policies'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium text-sm capitalize transition-colors ${
                      activeTab === tab
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'about' ? 'About Store' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.length > 0 ? (
                  products.map((product) => {
                    const price = parseFloat(product.priceMinor) / 100;
                    const stockStatus = (product.stock && product.stock > 0) 
                      ? (product.stock < 10 ? 'Low Stock' : 'In Stock')
                      : 'Out of Stock';
                    const stockColor = stockStatus === 'In Stock' ? 'green' : stockStatus === 'Low Stock' ? 'yellow' : 'red';
                    
                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          window.location.href = `/product-preview?id=${product.id}`;
                        }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                      >
                        <div className="relative w-full h-48">
                          <Image
                            src={product.media?.[0]?.url || "/images/cars/car-1.jpg"}
                            alt={product.title}
                            width={400}
                            height={250}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xl font-bold text-[#ee8e31]">
                              {price.toLocaleString()} {product.currency}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              stockColor === 'green' ? 'bg-green-100 text-green-700' :
                              stockColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {stockStatus}
                            </span>
                          </div>
                          <button className="w-full bg-[#EE8E32] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#d67a1f] transition-colors mt-2">
                            View Product
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-10">
                    <p className="text-gray-500">No products available</p>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs content */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-600">Reviews coming soon...</p>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">About Store</h3>
                <p className="text-gray-600 leading-relaxed">{vendorDescription}</p>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <p className="text-gray-600">Policies coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#F7941D] border-r-transparent"></div>
          <p className="mt-4 text-lg font-semibold text-gray-900">Loading...</p>
        </div>
      </div>
    }>
      <VendorStorePage />
    </Suspense>
  );
}
