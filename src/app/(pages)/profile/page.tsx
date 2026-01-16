"use client";
import Image from "next/image";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { CiBookmark } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { GoHistory } from "react-icons/go";
import { LuClock9 } from "react-icons/lu";
import { MdKeyboardArrowRight } from "react-icons/md";
import { GoCreditCard } from "react-icons/go";
import { HiLanguage } from "react-icons/hi2";
import { HiCheckCircle } from "react-icons/hi2";
import { IoLogOutOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";
import VerificationModal from "@/components/ui/VerificationModal";
import { resetUser } from "@/redux/authSlice";
import { userApi, type User } from "@/services/user.api";

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRefundTableModalOpen, setIsRefundTableModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const languages = [
    { name: "English", flag: "https://flagcdn.com/w20/us.png", code: "en" },
    { name: "Arabic", flag: "https://flagcdn.com/w20/sa.png", code: "ar" },
  ];

  // Mock refund request data
  const allRefundRequests = [
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "approved" as const,
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1002",
      requestDate: "24/5/2025",
      orderId: "TX-1002",
      amount: "$85.50",
      status: "rejected" as const,
      orderDate: "11 Aug 2025",
    },
    {
      id: "TX-1003",
      requestDate: "23/5/2025",
      orderId: "TX-1003",
      amount: "$200.00",
      status: "approved" as const,
      orderDate: "10 Aug 2025",
    },
    {
      id: "TX-1004",
      requestDate: "22/5/2025",
      orderId: "TX-1004",
      amount: "$150.00",
      status: "approved" as const,
      orderDate: "9 Aug 2025",
    },
    {
      id: "TX-1005",
      requestDate: "21/5/2025",
      orderId: "TX-1005",
      amount: "$90.00",
      status: "rejected" as const,
      orderDate: "8 Aug 2025",
    },
    {
      id: "TX-1006",
      requestDate: "20/5/2025",
      orderId: "TX-1006",
      amount: "$130.00",
      status: "approved" as const,
      orderDate: "7 Aug 2025",
    },
  ];

  const approvedRequests = allRefundRequests.filter((req) => req.status === "approved");
  const rejectedRequests = allRefundRequests.filter((req) => req.status === "rejected");

  const filteredRequests = useMemo(() => {
    let filtered = allRefundRequests;
    if (activeTab === "approved") filtered = approvedRequests;
    if (activeTab === "rejected") filtered = rejectedRequests;

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeTab, searchQuery]);

  const getStatusBadge = (status: "approved" | "rejected") => {
    if (status === "approved") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Rejected
      </span>
    );
  };

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is authenticated before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        // No token, redirect to login immediately
        toast.error("Please login to view your profile");
        router.push("/login");
        return;
      }

      // Try to load cached user data first
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error parsing cached user data:", error);
      }

      try {
        setLoading(true);
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        
        // Fetch wallet balance if available
        try {
          const { apiClient } = await import("@/services/api");
          const walletResponse = await apiClient.get("/wallet/balance");
          if (walletResponse.data.success && walletResponse.data.data) {
            // The response structure is: { success: true, data: { availableMinor: "...", ... } }
            const balanceData = walletResponse.data.data;
            const balance = parseFloat(balanceData.availableMinor || '0') / 100;
            setWalletBalance(balance.toFixed(2));
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
          // Wallet might not be available for all users, so we don't show error
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        // If unauthorized, forbidden, or user not found (deleted), redirect to login
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          dispatch(resetUser());
          
          // Dispatch custom event to notify Header component of auth state change
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("authStateChanged"));
          }
          
          // Show user-friendly message
          toast.error("Your account is no longer available. Please login again.", {
            duration: 4000,
          });
          
          // Redirect to login
          router.push("/login");
          return;
        } else {
          // If we have cached user data, show it even if API fails
          if (!user) {
            toast.error(error.message || "Failed to load profile. Showing cached data.");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, dispatch]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Reset Redux state
    dispatch(resetUser());
    
    // Dispatch custom event to notify Header component of auth state change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authStateChanged"));
    }
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Redirect to login - use window.location for immediate navigation
    window.location.href = "/login";
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsLanguageModalOpen(false);
    toast.success(`Language changed to ${language}`);
    // TODO: Save language preference to backend/localStorage
  };

  const handleRefundButtonClick = (type: "order" | "withdraw") => {
    setIsRequestModalOpen(false);
    if (type === "order") {
      setIsRefundTableModalOpen(true);
    } else {
      // Navigate to wallet refund request page
      router.push("/profile/wallet-refund-request");
    }
  };

  // Close dropdown when modal closes
  useEffect(() => {
    if (!isRefundTableModalOpen) {
      setOpenDropdownIndex(null);
    }
  }, [isRefundTableModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load profile. Please try again.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Back Icon and Profile Heading - Outside white background */}
      <div className="absolute top-0 left-0 z-10 px-4 md:px-6 pt-4 pb-2">
        <div className="flex flex-col">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-2"
            aria-label="Go back"
          >
            <Image
              src="/images/street/back-vector.png"
              alt="Back"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
          <h1 className="text-xl font-bold text-black">Profile</h1>
        </div>
      </div>

      {/* White Background Card */}
      <div className="relative z-10 mx-auto max-w-6xl w-full px-4 md:px-6 py-6 mt-16">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Request Button - Top Right */}
          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-[#EE8E32] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#d87a28] transition"
            >
              Request
            </button>
          </div>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src={user.profileImageUrl || `/images/avatar.png`}
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full object-cover shadow-md border-2 border-[#EE8E32]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `/images/avatar.png`;
              }}
            />
            <h2 className="mt-4 text-2xl font-bold text-black">
              {user.name || user.email.split('@')[0]}
            </h2>
            <p className="text-black font-semibold text-lg">@{user.email.split('@')[0]}</p>
            {user.customerType && (
              <p className={`text-sm mt-1 capitalize font-medium ${
                user.customerType === 'verified' ? 'text-green-600' : 
                user.customerType === 'verification_pending' ? 'text-yellow-600' :
                user.customerType === 'registered' ? 'text-blue-600' : 
                'text-gray-500'
              }`}>
                {user.customerType === 'verified' ? '✓ Verified Customer' : 
                 user.customerType === 'verification_pending' ? '⏳ Verification Pending' :
                 user.customerType === 'registered' ? 'Registered Customer' : 
                 'Guest'}
              </p>
            )}
          </div>

          {/* Menu List */}
          <div className="rounded-lg overflow-hidden space-y-5">
            {/* Balance */}
            <div 
              onClick={() => {
                window.location.href = "/profile/wallet-refund-request";
              }}
              className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              <div className="flex items-center gap-3 text-[#666666]">
                <GoCreditCard size={18} />
                <span>Balance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#EE8E32] font-semibold">QAR {walletBalance}</span>
                <MdKeyboardArrowRight color="#666666" size={20} />
              </div>
            </div>

            {/* Profile Setting */}
            <div 
              onClick={() => {
                window.location.href = "/profile/settings";
              }}
              className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4"
            >
              <div className="flex items-center gap-3 text-[#666666]">
                <FaRegUser size={16} />
                <span>Profile settings</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>

            {/* Bidding History */}
            <div 
              onClick={() => {
                window.location.href = "/bidding-history";
              }}
              className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4"
            >
              <div className="flex items-center gap-3 text-[#666666]">
                <GoHistory size={16} />
                <span>Bidding History</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>

            {/* Order History */}
            <div 
              onClick={() => {
                window.location.href = "/order-history";
              }}
              className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4"
            >
              <div className="flex items-center gap-3 text-[#666666]">
                <LuClock9 size={16} />
                <span>Order History</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>

            {/* Saved Items */}
            <div 
              onClick={() => {
                window.location.href = "/saved-items";
              }}
              className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 mt-4"
            >
              <div className="flex items-center gap-3 text-[#666666]">
                <CiBookmark size={16} />
                <span>Saved items</span>
              </div>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>

          {/* Language */}
          <div 
            onClick={() => setIsLanguageModalOpen(true)}
            className="flex justify-between items-center px-4 py-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 "
          >
            <div className="flex items-center gap-3 text-[#666666]">
              <HiLanguage size={18} />
              <span>Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{selectedLanguage}</span>
              <MdKeyboardArrowRight color="#666666" size={20} />
            </div>
          </div>
        </div>

          {/* Sign Out and Get Verified Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleLogout}
              className="cursor-pointer flex items-center justify-center gap-2 bg-[#EE8E32] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#d87a28] transition"
            >
              <span>Sign Out</span>
              <MdKeyboardArrowRight size={18} className="text-white" />
            </button>
            {/* Show Get Verified only if customer is not yet verified */}
            {user.customerType === "registered" || user.customerType === "verification_pending" ? (
              <button
                onClick={() => {
                  if (user.customerType === "verification_pending") {
                    // Already submitted documents, show pending message instead of resubmitting
                    setIsVerificationModalOpen(true);
                  } else {
                    // Not yet submitted -> go to upload page - use window.location for immediate navigation
                    window.location.href = "/upload-cnic";
                  }
                }}
                className="cursor-pointer flex items-center justify-center gap-2 bg-white border border-[#EE8E32] text-[#EE8E32] font-medium px-6 py-3 rounded-lg hover:bg-orange-50 transition"
              >
                <span>Get Verified</span>
                <HiCheckCircle size={18} className="text-[#EE8E32]" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Verification Pending Modal (re-uses global verification modal) */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        context="bidding"
        state="pending"
      />

      {/* Request Modal - First Modal with Buttons */}
      {isRequestModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsRequestModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative">
              {/* Close Button */}
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <IoClose size={20} className="text-gray-600" />
              </button>

              {/* Request Options */}
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Select Request Type</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleRefundButtonClick("order")}
                    className="flex-1 bg-[#EE8E32] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#d87a28] transition"
                  >
                    Order Refund
                  </button>
                  <button 
                    onClick={() => handleRefundButtonClick("withdraw")}
                    className="flex-1 bg-[#EE8E32] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#d87a28] transition"
                  >
                    Withdraw Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Refund Table Modal - Second Modal with Table */}
      {isRefundTableModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsRefundTableModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col relative">
              {/* Close Button */}
              <button
                onClick={() => setIsRefundTableModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition z-10"
                aria-label="Close modal"
              >
                <IoClose size={20} className="text-gray-600" />
              </button>

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Requests</h2>
                
                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`pb-3 px-1 font-medium text-sm transition relative ${
                      activeTab === "all"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All
                    <span className={`ml-2 font-semibold ${activeTab === "all" ? "text-blue-600" : "text-gray-600"}`}>
                      {allRefundRequests.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("approved")}
                    className={`pb-3 px-1 font-medium text-sm transition relative flex items-center gap-2 ${
                      activeTab === "approved"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Approved
                    <span className={`font-semibold ${activeTab === "approved" ? "text-green-600" : "text-gray-600"}`}>
                      {approvedRequests.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("rejected")}
                    className={`pb-3 px-1 font-medium text-sm transition relative flex items-center gap-2 ${
                      activeTab === "rejected"
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Rejected
                    <span className={`font-semibold ${activeTab === "rejected" ? "text-red-600" : "text-gray-600"}`}>
                      {rejectedRequests.length}
                    </span>
                  </button>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-3 mt-4">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-xs">
                    <Image
                      src="/icons/search.svg"
                      alt="Search"
                      width={18}
                      height={18}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm w-full"
                    />
                  </div>

                  {/* Filter Button */}
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Image
                      src="/icons/filter.svg"
                      alt="Filter"
                      width={18}
                      height={18}
                      className="text-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Filter</span>
                  </button>

                  {/* New Request Button */}
                  <button
                    onClick={() => {
                      setIsRefundTableModalOpen(false);
                      router.push("/profile/order-refund");
                    }}
                    className="px-4 py-2 bg-[#EE8E32] text-white rounded-lg hover:bg-[#d87a28] transition font-medium text-sm"
                  >
                    New Request
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Request ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Request Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Order/Transaction ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Requested Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Order Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            No refund requests found
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((request, index) => (
                          <tr
                            key={`${request.id}-${index}`}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="py-4 px-4 text-sm text-gray-900">{request.id}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{request.requestDate}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{request.orderId}</td>
                            <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                              {request.amount}
                            </td>
                            <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{request.orderDate}</td>
                            <td className="py-4 px-4 relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition relative"
                                aria-label="More options"
                              >
                                <HiOutlineDotsVertical size={20} className="text-gray-600" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {openDropdownIndex === index && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-[60]"
                                    onClick={() => setOpenDropdownIndex(null)}
                                  ></div>
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[70] min-w-[160px]">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsRefundTableModalOpen(false);
                                        router.push(`/profile/refund-request-details?id=${request.id}&status=${request.status}`);
                                        setOpenDropdownIndex(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                      <span>View Details</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Language Selection Modal */}
      {isLanguageModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsLanguageModalOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative">
              {/* Close Button */}
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition"
                aria-label="Close modal"
              >
                <IoClose size={20} className="text-gray-600" />
              </button>

              {/* Language Options */}
              <div className="p-6 pt-6 space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 mt-6 rounded-lg transition text-left ${
                      selectedLanguage === lang.name
                        ? "bg-orange-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Image
                      src={lang.flag}
                      alt={lang.name}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span className="text-black font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

