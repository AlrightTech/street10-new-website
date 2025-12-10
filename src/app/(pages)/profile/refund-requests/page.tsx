"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiUpload } from "react-icons/fi";

type StatusTab = "all" | "approved" | "rejected";

interface RefundRequest {
  id: string;
  requestDate: string;
  orderId: string;
  amount: string;
  status: "approved" | "rejected";
  orderDate: string;
}

export default function RefundRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API call
  const allRequests: RefundRequest[] = [
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "approved",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "rejected",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "approved",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "rejected",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "approved",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "rejected",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "approved",
      orderDate: "12 Aug 2025",
    },
    {
      id: "TX-1001",
      requestDate: "25/5/2025",
      orderId: "TX-1001",
      amount: "$120.00",
      status: "rejected",
      orderDate: "12 Aug 2025",
    },
  ];

  const approvedRequests = allRequests.filter((req) => req.status === "approved");
  const rejectedRequests = allRequests.filter((req) => req.status === "rejected");

  const getFilteredRequests = () => {
    let filtered = allRequests;
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
  };

  const filteredRequests = getFilteredRequests();

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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-50 px-4 md:px-6 pt-6 pb-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="p-1 hover:opacity-80 transition mb-3 cursor-pointer relative z-50"
            aria-label="Go back"
            type="button"
          >
            <Image
              src="/images/street/back-vector.png"
              alt="Back"
              width={24}
              height={24}
              className="object-contain pointer-events-none"
            />
          </button>
          <h1 className="text-2xl font-bold text-black mb-6">Refund Requests</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-6 py-6 mt-32">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Tabs and Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            {/* Status Tabs */}
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
                  67
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
                  6
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
                  6
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <FiUpload size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Export</span>
              </button>

              {/* Search Input */}
              <div className="relative">
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
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm w-48"
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
            </div>
          </div>

          {/* Table */}
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
                      <td className="py-4 px-4">
                        <button className="p-1 hover:bg-gray-200 rounded transition">
                          <HiOutlineDotsVertical size={20} className="text-gray-600" />
                        </button>
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
  );
}

