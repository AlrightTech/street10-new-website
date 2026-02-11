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

  const companyDocs = (vendor as any).companyDocs as any || {};
  const businessDetails = companyDocs?.businessDetails || {};
  const storeInfo = companyDocs?.storeInfo || {};
  const socialMedia = businessDetails.socialMedia || {};
  const shippingPolicy = companyDocs?.shippingPolicy || {};
  const refundPolicy = companyDocs?.refundPolicy || {};
  const terms = companyDocs?.terms || {};
  
  // Get store name from businessDetails.storeName or fallback to vendor.name
  const storeName = businessDetails.storeName || vendor.name;
  const vendorCategory = businessDetails.category || "General";
  const vendorDescription = businessDetails.description || "Your trusted vendor";
  const vendorLogo = (vendor as any).profileImageUrl || "/icons/honda.svg";
  const vendorBanner = businessDetails.bannerImage || "/images/vendor-banner.jpg";
  
  // Contact information
  const contactEmail = storeInfo.contactEmail || vendor.email || "";
  const contactPhone = storeInfo.contactPhone || vendor.phone || "";
  const address = storeInfo.address || businessDetails.businessAddress || businessDetails.location || "Location not specified";
  
  // These values will be calculated from actual data when review/order systems are fully implemented
  // For now, using default values that can be updated when those features are available
  const rating = 4.8; // Will be calculated from reviews when review system is implemented
  const reviewCount = 324; // Will be fetched from reviews API when available
  const memberSince = new Date(vendor.createdAt).getFullYear();

  const productCount = products.length;
  const totalOrders = "2.5K+"; // Will be calculated from orders when order tracking is implemented
  const responseTime = "2h"; // Will be calculated from vendor response data when available

  return (
    <div className="bg-[#f4f5f6] min-h-screen pb-14 overflow-x-hidden">
      {/* Vendor Banner and Profile */}
      <div className="relative w-full h-64 md:h-80 mb-20 md:mb-24">
        {/* Banner Image Container */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={vendorBanner}
            alt={`${storeName} banner`}
            fill
            className="object-cover"
            quality={100}
            priority
            sizes="100vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/vendor-banner.jpg";
            }}
          />
        </div>
        {/* Vendor Profile Card Overlay - Fixed positioning with proper z-index */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-6xl px-4 z-30">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6 relative z-30">
            {/* Vendor Logo */}
            <div className="w-24 h-24 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <Image
                src={vendorLogo}
                alt={storeName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                quality={100}
                priority
                sizes="96px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/icons/honda.svg";
                }}
              />
            </div>
            
            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{storeName}</h1>
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
                {address && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                    <span>{address}</span>
                </div>
                )}
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

      {/* Main Content - Adjusted padding since card is now properly positioned */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Vendor Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Vendor */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About Store</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{vendorDescription}</p>
              
              {/* Contact Information */}
              {(contactEmail || contactPhone || address) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {contactEmail && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${contactEmail}`} className="hover:text-purple-600">{contactEmail}</a>
                      </div>
                    )}
                    {contactPhone && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${contactPhone}`} className="hover:text-purple-600">{contactPhone}</a>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Social Media Links */}
              {(socialMedia.facebook || socialMedia.instagram || socialMedia.linkedin || socialMedia.tiktok) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Follow Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {socialMedia.facebook && (
                      <a 
                        href={socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-xs">Facebook</span>
                      </a>
                    )}
                    {socialMedia.instagram && (
                      <a 
                        href={socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span className="text-xs">Instagram</span>
                      </a>
                    )}
                    {socialMedia.linkedin && (
                      <a 
                        href={socialMedia.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="text-xs">LinkedIn</span>
                      </a>
                    )}
                    {socialMedia.tiktok && (
                      <a 
                        href={socialMedia.tiktok} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                        <span className="text-xs">TikTok</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Stats - Matching the design from image */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Stats</h2>
              <div className="space-y-3">
                {/* Total Products */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Total Products</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{productCount}</span>
                </div>
                
                {/* Total Orders */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Total Orders</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{totalOrders}</span>
                </div>
                
                {/* Avg. Rating */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Avg. Rating</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{rating}</span>
                </div>
                
                {/* Response Time */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Response Time</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{responseTime}</span>
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
                <p className="text-gray-600 leading-relaxed mb-6">{vendorDescription}</p>
                
                {/* Contact Information */}
                {(contactEmail || contactPhone || address) && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      {contactEmail && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a href={`mailto:${contactEmail}`} className="hover:text-purple-600">{contactEmail}</a>
                        </div>
                      )}
                      {contactPhone && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <a href={`tel:${contactPhone}`} className="hover:text-purple-600">{contactPhone}</a>
                        </div>
                      )}
                      {address && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Social Media Links */}
                {(socialMedia.facebook || socialMedia.instagram || socialMedia.linkedin || socialMedia.tiktok) && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Follow Us</h4>
                    <div className="flex flex-wrap gap-3">
                      {socialMedia.facebook && (
                        <a 
                          href={socialMedia.facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>Facebook</span>
                        </a>
                      )}
                      {socialMedia.instagram && (
                        <a 
                          href={socialMedia.instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span>Instagram</span>
                        </a>
                      )}
                      {socialMedia.linkedin && (
                        <a 
                          href={socialMedia.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {socialMedia.tiktok && (
                        <a 
                          href={socialMedia.tiktok} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                          <span>TikTok</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                {/* Shipping Policy */}
                {(shippingPolicy?.termsConditions || 
                  shippingPolicy?.description || 
                  shippingPolicy?.deliveryTime || 
                  shippingPolicy?.estimatedDeliveryTime ||
                  shippingPolicy?.freeShippingThreshold) && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Shipping Policy</h3>
                    </div>
                    
                    {(shippingPolicy?.termsConditions || shippingPolicy?.description) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Terms & Conditions</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {shippingPolicy.termsConditions || shippingPolicy.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(shippingPolicy?.deliveryTime || shippingPolicy?.estimatedDeliveryTime) && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Standard Delivery Time</p>
                            <p className="text-sm font-semibold text-gray-900">{shippingPolicy.deliveryTime || shippingPolicy.estimatedDeliveryTime}</p>
                          </div>
                        </div>
                      )}
                      {shippingPolicy?.freeShippingThreshold && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Free Shipping Threshold</p>
                            <p className="text-sm font-semibold text-gray-900">{shippingPolicy.freeShippingThreshold}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Refund & Return Policy */}
                {(refundPolicy?.conditions || 
                  refundPolicy?.returnRefundConditions || 
                  refundPolicy?.returnWindow || 
                  refundPolicy?.refundEligibility ||
                  refundPolicy?.processingTime || 
                  refundPolicy?.refundProcessingTime) && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Refund & Return Policy</h3>
                    </div>
                    
                    {(refundPolicy?.conditions || refundPolicy?.returnRefundConditions) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Return & Refund Conditions</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {refundPolicy.conditions || refundPolicy.returnRefundConditions}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(refundPolicy?.returnWindow || refundPolicy?.refundEligibility) && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Return Window</p>
                            <p className="text-sm font-semibold text-gray-900">{refundPolicy.returnWindow || refundPolicy.refundEligibility}</p>
                          </div>
                        </div>
                      )}
                      {(refundPolicy?.processingTime || refundPolicy?.refundProcessingTime) && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Refund Processing Time</p>
                            <p className="text-sm font-semibold text-gray-900">{refundPolicy.processingTime || refundPolicy.refundProcessingTime}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Privacy & Other Policies */}
                {(terms?.privacyPolicy || 
                  terms?.termsOfService || 
                  terms?.termsAndConditions ||
                  terms?.customPolicies || 
                  terms?.customNotes) && (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="text-lg font-bold text-gray-900">Privacy & Other Policies</h3>
                    </div>
                    
                    {terms?.privacyPolicy && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Privacy Policy</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {terms.privacyPolicy}
                        </p>
                      </div>
                    )}
                    
                    {(terms?.termsOfService || terms?.termsAndConditions) && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Terms of Service</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {terms.termsOfService || terms.termsAndConditions}
                        </p>
                      </div>
                    )}
                    
                    {(terms?.customPolicies || terms?.customNotes) && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Policies</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {terms.customPolicies || terms.customNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* No Policies Message */}
                {!(shippingPolicy?.termsConditions || shippingPolicy?.description || shippingPolicy?.deliveryTime || 
                   refundPolicy?.conditions || refundPolicy?.returnRefundConditions || refundPolicy?.returnWindow ||
                   terms?.privacyPolicy || terms?.termsOfService || terms?.customPolicies) && (
                  <div className="text-center py-10">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No policies available yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Policies will be displayed here once the vendor adds them.</p>
                  </div>
                )}
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
