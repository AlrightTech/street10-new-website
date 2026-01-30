"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auctionApi } from "@/services/auction.api";
import { categoryApi } from "@/services/category.api";
import type { Auction } from "@/services/auction.api";
import type { Category } from "@/services/category.api";

function Cars() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>("all"); // Default to "all"
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableFilters, setAvailableFilters] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Array<{ filterId: string; value: string }>>([]);

  // Fetch categories that have bidding products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getWithProducts('bidding');
        if (response.success && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Keep "all" as default, don't auto-select first category

  // Fetch subcategories when a category is selected (not "all")
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategoryId || selectedCategoryId === "all") {
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
  }, [selectedCategoryId]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const filters: any = { limit: 20 };
        
        // Only add category filters if not "all"
        if (selectedCategoryId && selectedCategoryId !== "all") {
          if (selectedSubcategoryId) {
            filters.subcategory_id = selectedSubcategoryId;
          } else {
            filters.category_id = selectedCategoryId;
          }
        }
        
        // Add filter values if any are selected
        if (selectedFilters.length > 0) {
          const filterObj: Record<string, string> = {};
          selectedFilters.forEach(fv => {
            if (fv.filterId && fv.value) {
              filterObj[fv.filterId] = fv.value;
            }
          });
          if (Object.keys(filterObj).length > 0) {
            filters.filters = JSON.stringify(filterObj);
          }
        }
        
        const response = await auctionApi.getActive(filters);
        setAuctions(response.data || []);
      } catch (error) {
        console.error("Error fetching active auctions:", error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [selectedCategoryId, selectedSubcategoryId, selectedFilters]);

  // Handle car click - always navigate to detail page
  // Registration/verification will be handled on the detail page
  const handleCarClick = (e: React.MouseEvent, carId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Use window.location.href for faster navigation to detail page
    window.location.href = `/car-preview?id=${carId}&type=auction`;
  };

  // Transform auction data to match the car format
  const cars = auctions.map((auction) => {
    const currentBid = auction.currentBid
      ? parseFloat(auction.currentBid.amountMinor) / 100
      : (auction as any).startingPrice
      ? parseFloat((auction as any).startingPrice) / 100
      : 0;
    const endDate = new Date(auction.endAt);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const end = diff <= 0 ? "Ended" : `${days}d : ${hours}h : ${minutes}m`;

    // Map auction state to display status
    const getStatusFromState = (state: string, reservePriceMet?: boolean) => {
      switch (state) {
        case "scheduled":
          return "Scheduled";
        case "live":
          // Check reserve price status for live auctions
          if (reservePriceMet === false) {
            return "Pending"; // Reserve price not met yet
          }
          return "Live"; // Reserve price met or no reserve price
        case "ended":
          // If reserve price not met, show as "Ended" (unsold)
          if (reservePriceMet === false) {
            return "Ended";
          }
          return "Ended"; // Will show as "Sold" in detail page if has bid
        case "settled":
          return "Sold";
        case "draft":
          return "Scheduled";
        default:
          return "Scheduled";
      }
    };

    const reservePriceMet = (auction as any).reservePriceMet;
    const status = getStatusFromState(auction.state, reservePriceMet);

    return {
      id: auction.id,
      src: auction.product?.media?.[0]?.url || "/images/cars/car-1.jpg",
      bid: `${currentBid.toLocaleString()} QAR`,
      end: end,
      plate: auction.product?.title || "Auction Item",
      provider: ["Provided by us", auction.type || "Auction", status],
    };
  });

  // Fetch filters for selected category/subcategory (not for "all")
  useEffect(() => {
    const fetchFilters = async () => {
      const categoryId = selectedSubcategoryId || (selectedCategoryId === "all" ? null : selectedCategoryId);
      if (!categoryId || selectedCategoryId === "all") {
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
  }, [selectedCategoryId, selectedSubcategoryId]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null); // Reset subcategory when main category changes
    setSelectedFilters([]); // Reset filters
  };

  return (
    <section className="pt-5 pb-20 px-4 md:px-10 lg:px-20 relative">
      {/* Category Cards - Square cards in a single row */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-6">
          {/* "All" tab - always shown first */}
          <div
            onClick={() => handleCategoryClick("all")}
            className={`flex-shrink-0 w-[180px] text-lg flex flex-col items-center justify-center rounded-xl   
                       hover:shadow-md cursor-pointer transition-all duration-200 px-6 py-8 ${
                         selectedCategoryId === "all"
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
          
          {/* Category cards */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
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

      {/* Subcategory Tabs with Filter Icon - Only show when a specific category is selected (not "all") */}
      {selectedCategoryId && selectedCategoryId !== "all" && (
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
      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">Loading auctions...</p>
          </div>
        ) : cars.length > 0 ? (
          cars.map((car, index) => (
            <div
              key={car.id || index}
              onClick={(e) => handleCarClick(e, car.id)}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow cursor-pointer"
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
                <div className="flex gap-2 absolute top-3 right-3 md:top-4 md:right-4 pointer-events-none z-10">
                  <Image
                    src={"/icons/frwrd.svg"}
                    alt="forward"
                    width={36}
                    height={36}
                  />
                  <Image
                    src={"/icons/badge-1.svg"}
                    alt="badge"
                    width={36}
                    height={36}
                  />
                </div>
                {/* Auction info overlay */}
                <div
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2
                          flex flex-col sm:flex-row items-center justify-between gap-4
                          px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-white
                          bg-white/20 backdrop-blur-md shadow-lg w-[90%] sm:w-[85%] lg:w-[80%] pointer-events-none z-10"
                >
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm">Auction ends</p>
                    <p className="text-sm font-medium mt-1">{car.end}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-xs sm:text-sm">Current Bid</p>
                    <p className="text-sm font-medium mt-1">{car.bid}</p>
                  </div>
                </div>
              </div>

              {/* Car info */}
              <div className="p-4 border-t mt-auto flex flex-col justify-between">
                <p className="text-[#333333] font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                  {car.plate}
                </p>
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
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No auctions available</p>
          </div>
        )}
      </div>

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
