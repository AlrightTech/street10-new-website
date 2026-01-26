"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { homeApi } from "@/services/home.api";
import { vendorApi } from "@/services/vendor.api";
import { categoryApi } from "@/services/category.api";
import VendorStoreCard from "./VendorStoreCard";
import type { Product } from "@/services/product.api";
import type { Vendor } from "@/services/vendor.api";
import type { Category } from "@/services/category.api";

function Cars() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>("all"); // Default to "all"
  const [showVendorsTab, setShowVendorsTab] = useState(false); // Special "Vendors" tab state
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Array<{ filterId: string; value: string }>>([]);

  // Fetch categories that have vendor products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getWithProducts('vendor');
        if (response.success && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Keep "all" as default, don't auto-select first category (unless Vendors tab is shown)

  // Fetch subcategories when a category is selected (not "all" and not Vendors tab)
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId || selectedCategoryId === "all" || showVendorsTab) {
        setSubcategories([]);
        setSelectedSubcategoryId(null);
        return;
      }
      try {
        const response = await categoryApi.getSubcategories(selectedCategoryId);
        if (response.success && response.data.subcategories) {
          setSubcategories(response.data.subcategories);
          setSelectedSubcategoryId(null);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [selectedCategoryId, showVendorsTab]);

  // Fetch vendors when "Vendors" tab is selected OR to populate vendorMap for product cards
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        // Fetch all vendors and filter to show only approved/pending ones
        const vendorsResponse = await vendorApi.getAll({ limit: 100 });
        
        // Filter to only show approved and pending vendors on the frontend
        const approvedVendors = (vendorsResponse.data || []).filter(
          (vendor) => vendor.status === "approved" || vendor.status === "pending"
        );
        setVendors(approvedVendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setVendors([]);
      }
    };

    fetchVendors();
  }, []); // Fetch once on mount

  // Fetch products when a category is selected (not Vendors tab)
  useEffect(() => {
    const fetchData = async () => {
      if (showVendorsTab) {
        setProducts([]); // Clear products when showing vendors
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const filters: {
          categoryId?: string;
          subcategoryId?: string;
          filterValues?: Array<{ filterId: string; value: string }>;
        } = {};
        
        // Only add category filters if not "all"
        if (selectedCategoryId && selectedCategoryId !== "all") {
          if (selectedSubcategoryId) {
            filters.subcategoryId = selectedSubcategoryId;
          } else {
            filters.categoryId = selectedCategoryId;
          }
        }
        
        // Add filter values if any are selected
        if (selectedFilters.length > 0) {
          filters.filterValues = selectedFilters.filter(f => f.filterId && f.value);
        }
        
        const productsResponse = await homeApi.getVendorOfferings(20, filters);
        setProducts(productsResponse.data || []);
      } catch (error) {
        console.error("Error fetching vendor products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategoryId, selectedSubcategoryId, selectedFilters, showVendorsTab]);

  // Create a map of vendor IDs to vendor data
  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  // Transform product data to match the car format
  const cars = products.map((product) => {
    const price = parseFloat(product.priceMinor) / 100;
    const vendor = product.vendor?.id ? vendorMap.get(product.vendor.id) : null;
    return {
      id: product.id,
      price: `${price.toLocaleString()} QAR`,
      icon: "/icons/honda.svg",
      brand: vendor?.name || product.vendor?.name || "Vendor",
      src: product.media?.[0]?.url || "/images/cars/car-1.jpg",
      bid: `${price.toLocaleString()} QAR`,
      end: "Available",
      plate: product.title || "Product",
      provider: ["Provided by us", product.categories?.[0]?.name || "General", "In Stock"],
    };
  });

  // Fetch filters for selected category/subcategory (not for "all" or Vendors tab)
  useEffect(() => {
    const fetchFilters = async () => {
      const categoryId = selectedSubcategoryId || (selectedCategoryId === "all" ? null : selectedCategoryId);
      if (!categoryId || selectedCategoryId === "all" || showVendorsTab) {
        setAvailableFilters([]);
        setSelectedFilters([]);
        return;
      }
      try {
        const response = await categoryApi.getCategoryFilters(categoryId);
        if (response.success && response.data.filters) {
          setAvailableFilters(response.data.filters);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
        setAvailableFilters([]);
      }
    };
    fetchFilters();
  }, [selectedCategoryId, selectedSubcategoryId, showVendorsTab]);

  const handleCategoryClick = (categoryId: string | null) => {
    if (categoryId === 'vendors-tab') {
      // Special "Vendors" tab
      setShowVendorsTab(true);
      setSelectedCategoryId(null);
      setSelectedSubcategoryId(null);
      setSelectedFilters([]);
    } else {
      setShowVendorsTab(false);
      setSelectedCategoryId(categoryId);
      setSelectedSubcategoryId(null); // Reset subcategory when main category changes
      setSelectedFilters([]); // Reset filters
    }
  };

  return (
    <section className="pt-5 pb-20 px-4 md:px-10 lg:px-20 relative">
      {/* Category Cards - Square cards in a single row */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-6">
          {/* Special "Vendors" tab - always shown first */}
          <div
            onClick={() => handleCategoryClick('vendors-tab')}
            className={`flex-shrink-0 w-[180px] text-lg flex flex-col items-center justify-center rounded-xl   
                       hover:shadow-md cursor-pointer transition-all duration-200 px-6 py-8 ${
                         showVendorsTab
                           ? 'bg-[#f6eae0] text-[#ee8e31] shadow-md'
                           : 'bg-white hover:bg-[#f6eae0] hover:text-[#ee8e31] text-[#666666]'
                       }`}
          >
            <Image 
              src="/icons/mdi_handshake.svg" 
              alt="Vendors" 
              width={40} 
              height={40}
              className="object-contain"
              onError={(e) => {
                // Fallback to default icon
                (e.target as HTMLImageElement).src = "/icons/categories.svg";
              }}
            />
            <p className="mt-3 font-medium">Vendors</p>
          </div>
          
          {/* "All" tab - shown after Vendors tab */}
          <div
            onClick={() => handleCategoryClick("all")}
            className={`flex-shrink-0 w-[180px] text-lg flex flex-col items-center justify-center rounded-xl   
                       hover:shadow-md cursor-pointer transition-all duration-200 px-6 py-8 ${
                         selectedCategoryId === "all" && !showVendorsTab
                           ? 'bg-[#f6eae0] text-[#ee8e31] shadow-md'
                           : 'bg-white hover:bg-[#f6eae0] hover:text-[#ee8e31] text-[#666666]'
                       }`}
          >
            <Image 
              src="/icons/categories.svg" 
              alt="All" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <p className="mt-3 font-medium">All</p>
          </div>
          
          {/* Product category cards */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id && !showVendorsTab;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-shrink-0 w-[180px] text-lg flex flex-col items-center justify-center rounded-xl   
                           hover:shadow-md cursor-pointer transition-all duration-200 px-6 py-8 ${
                             isSelected
                               ? 'bg-[#f6eae0] text-[#ee8e31] shadow-md'
                               : 'bg-white hover:bg-[#f6eae0] hover:text-[#ee8e31] text-[#666666]'
                           }`}
              >
                {(() => {
                  const iconUrl = (cat.langData as any)?.en?.iconUrl || cat.icon;
                  return iconUrl ? (
                    <Image 
                      src={iconUrl} 
                      alt={cat.name} 
                      width={40} 
                      height={40}
                      className="object-contain"
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        (e.target as HTMLImageElement).src = "/icons/categories.svg";
                      }}
                    />
                  ) : (
                    <Image 
                      src="/icons/categories.svg" 
                      alt={cat.name} 
                      width={40} 
                      height={40}
                      className="object-contain"
                    />
                  );
                })()}
                <p className="mt-3 font-medium">{cat.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subcategory Tabs with Filter Icon - Only show when a specific category is selected (not "all" or Vendors tab) */}
      {selectedCategoryId && selectedCategoryId !== "all" && !showVendorsTab && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center items-center px-4">
          {subcategories.length > 0 && (
            <>
              <button
                onClick={() => {
                  setSelectedSubcategoryId(null);
                  setSelectedFilters([]);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !selectedSubcategoryId
                    ? 'bg-[#EE8E32] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {subcategories.map(subcat => (
                <button
                  key={subcat.id}
                  onClick={() => {
                    setSelectedSubcategoryId(subcat.id);
                    setSelectedFilters([]); // Reset filters when subcategory changes
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedSubcategoryId === subcat.id
                      ? 'bg-[#EE8E32] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {subcat.name}
                </button>
              ))}
            </>
          )}
          {/* Filter Icon - Always show when category is selected */}
          <button
            onClick={() => setShowFilterModal(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 flex items-center gap-2 transition ${subcategories.length > 0 ? 'ml-2' : ''}`}
            title="Filter products"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
          </button>
        </div>
      )}
      {/* Vendor Store Cards Grid - Show when "Vendors" tab is selected */}
      {showVendorsTab && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">Loading vendors...</p>
            </div>
          ) : vendors.length > 0 ? (
            vendors.map((vendor) => (
              <VendorStoreCard key={vendor.id} vendor={vendor} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No vendors available</p>
              <p className="text-sm text-gray-400 mt-2">Vendors count: {vendors.length}</p>
              <p className="text-xs text-gray-400 mt-1">Check browser console for vendor API response</p>
            </div>
          )}
        </div>
      )}

      {/* Product Cards Grid - Show when a product category is selected */}
      {!showVendorsTab && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">Loading vendor products...</p>
            </div>
          ) : cars.length > 0 ? (
          cars.map((car, index) => (
            <div
              key={car.id || index}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
            >
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Navigate to product detail page for vendor products
                window.location.href = `/product-preview?id=${car.id}`;
              }}
              className="cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative w-full flex-shrink-0">
                <Image
                  src={car.src}
                  alt={`Car ${index + 1}`}
                  width={400}
                  height={250}
                  className="w-full h-56 md:h-64 lg:h-72 object-cover"
                />

                {/* Top-right badges */}
                <div className="flex gap-2 absolute top-3 right-3 md:top-4 md:right-4">
                  <Image
                    src={"/icons/badge-1.svg"}
                    alt="badge"
                    width={36}
                    height={36}
                  />
                </div>
              </div>

              {/* Car info */}
              <div className="p-4 border-t mt-auto flex flex-col justify-between">
                <div className="mb-2 sm:mb-3 flex justify-between items-center">
                  <p className="text-[#333333] font-medium  text-sm sm:text-base">
                    {car.plate}
                  </p>
                  <p className="text-[#ee8e31] font-semibold  text-xl ">
                    {car.price}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {car.provider.map((info, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-xs sm:text-sm bg-white rounded-full text-[#666666] shadow-[0px_1px_4px_0px_#0000001A]"
                    >
                      {info}
                    </span>
                  ))}
                </div>
                <div className="flex justify-start gap-4 items-center mt-5">
                  <Image src={car?.icon} alt="badge" width={36} height={36} />
                  <p> {car.brand}</p>
                </div>
              </div>
            </div>
          </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No vendor products available</p>
          </div>
        )}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Filter Products</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {availableFilters.length > 0 ? (
              <div className="space-y-4">
                {availableFilters.map((filter: any) => {
                  const filterData = filter.filter || filter;
                  const currentFilter = selectedFilters.find(f => f.filterId === filterData.id);
                  return (
                    <div key={filterData.id} className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {filterData.i18n?.en?.label || filterData.key || filterData.name}
                      </label>
                      {filterData.type === 'number' ? (
                        <input
                          type="number"
                          value={currentFilter?.value || ''}
                          onChange={(e) => {
                            const newFilters = selectedFilters.filter(f => f.filterId !== filterData.id);
                            if (e.target.value) {
                              newFilters.push({ filterId: filterData.id, value: e.target.value });
                            }
                            setSelectedFilters(newFilters);
                          }}
                          placeholder="Enter value"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent"
                        />
                      ) : filterData.options?.values && filterData.options.values.length > 0 ? (
                        <select
                          value={currentFilter?.value || ''}
                          onChange={(e) => {
                            const newFilters = selectedFilters.filter(f => f.filterId !== filterData.id);
                            if (e.target.value) {
                              newFilters.push({ filterId: filterData.id, value: e.target.value });
                            }
                            setSelectedFilters(newFilters);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent"
                        >
                          <option value="">Select {filterData.i18n?.en?.label || filterData.key}</option>
                          {filterData.options.values.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={currentFilter?.value || ''}
                          onChange={(e) => {
                            const newFilters = selectedFilters.filter(f => f.filterId !== filterData.id);
                            if (e.target.value) {
                              newFilters.push({ filterId: filterData.id, value: e.target.value });
                            }
                            setSelectedFilters(newFilters);
                          }}
                          placeholder="Enter value"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No filters available for this category</p>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedFilters([]);
                  setShowFilterModal(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-[#EE8E32] text-white rounded-lg hover:bg-[#d67a1f]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default Cars;
