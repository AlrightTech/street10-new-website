"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiOutlineEye, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { FiEdit, FiFileText } from "react-icons/fi";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";

export default function RefundRequestDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const statusParam = searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  
  const status = statusParam || "pending";

  // Mock data based on status
  const getRequestData = () => {
    const baseData = {
      id: requestId || "RR-2024-001",
      submissionDate: "March 15, 2024 at 2:30 PM",
      orderId: "ORD-2024-789",
      requestedAmount: "$249.99",
      reason: "Product arrived damaged. The packaging was torn and the item has visible scratches on the surface. I would like to request a full refund as the product is not usable in this condition.",
    };

    if (status === "approved") {
      return {
        ...baseData,
        status: "approved" as const,
        adminNotes: "Payment Has Been Sent",
      };
    } else if (status === "rejected") {
      return {
        ...baseData,
        status: "rejected" as const,
        adminNotes: "Request rejected due to policy violation.",
      };
    } else {
      return {
        ...baseData,
        status: "pending" as const,
        adminNotes: "",
      };
    }
  };

  const [requestData] = useState(getRequestData());
  const [adminNotes, setAdminNotes] = useState(requestData.adminNotes || "");

  // Activity log based on status
  const getActivityLog = () => {
    const baseLog = [
      {
        type: "submitted",
        icon: HiOutlineCheckCircle,
        date: "March 15, 2024 at 2:30 PM",
        description: "Refund request created by user",
        color: "text-blue-600",
      },
      {
        type: "viewed",
        icon: HiOutlineEye,
        date: "March 15, 2024 at 4:15 PM",
        description: "Admin John Doe reviewed the request",
        color: "text-purple-600",
      },
    ];

    if (status === "approved") {
      return [
        ...baseLog,
        {
          type: "approved",
          icon: HiOutlineCheckCircle,
          date: "March 17, 2024 at 4:18 PM",
          description: "admin Approved",
          color: "text-orange-600",
        },
      ];
    } else if (status === "rejected") {
      return [
        ...baseLog,
        {
          type: "rejected",
          icon: HiOutlineXCircle,
          date: "March 16, 2024 at 3:20 PM",
          description: "Request rejected by admin",
          color: "text-red-600",
        },
      ];
    } else {
      return [
        ...baseLog,
        {
          type: "pending",
          icon: HiOutlineClock,
          date: "Awaiting admin decision",
          description: "",
          color: "text-gray-600",
        },
      ];
    }
  };

  const [activityLog] = useState(getActivityLog());

  const [userInfo] = useState({
    name: "Sarah Johnson",
    membership: "Premium Member",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    userId: "USR-2023-456",
    joinDate: "January 15, 2023",
    totalOrders: 24,
    totalSpent: "$2,847.50",
    refundRequests: 3,
    accountStatus: "Active",
  });

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  const getActionButtons = () => {
    if (status === "approved") {
      return (
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
            <FiFileText size={18} />
            View Document
          </button>
          <button 
            onClick={() => router.push(`/profile/request-more-info?requestId=${requestData.id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <HiOutlineQuestionMarkCircle size={18} />
            Request More Info
          </button>
        </div>
      );
    } else if (status === "rejected") {
      return (
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/profile/request-more-info?requestId=${requestData.id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <HiOutlineQuestionMarkCircle size={18} />
            Request More Info
          </button>
        </div>
      );
    } else {
      // Pending
      return (
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
            <HiOutlineXCircle size={18} />
            Reject Request
          </button>
          <button 
            onClick={() => router.push(`/profile/request-more-info?requestId=${requestData.id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <HiOutlineQuestionMarkCircle size={18} />
            Request More Info
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden py-6">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Image src="/images/street/profile.png" alt="image" fill className="opacity-5" />
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
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-6 py-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Refund Request Details Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Refund Request Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Request ID</p>
                    <p className="text-base font-semibold text-gray-900">{requestData.id}</p>
                  </div>
                  {getStatusBadge(requestData.status)}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Submission Date</p>
                  <p className="text-base text-gray-900">{requestData.submissionDate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Order/Transaction ID</p>
                  <button
                    onClick={() => {
                      // Navigate to order details
                      router.push(`/order-history?orderId=${requestData.orderId}`);
                    }}
                    className="text-base text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {requestData.orderId}
                  </button>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Requested Amount</p>
                  <p className="text-base font-semibold text-gray-900">{requestData.requestedAmount}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Reason/Note from User</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{requestData.reason}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
              {getActionButtons()}
              
              {/* Admin Notes - Show for approved status */}
              {status === "approved" && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition resize-none"
                    placeholder="Payment Has Been Sent"
                  />
                </div>
              )}
            </div>

            {/* User Notes Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Notes</h2>
              <textarea
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#EE8E32] focus:border-transparent outline-none transition resize-none"
                placeholder="Enter your notes regarding this refund request...."
              />
            </div>

            {/* Activity Log Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Log</h2>
              <div className="space-y-4">
                {activityLog.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`flex-shrink-0 ${activity.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === "submitted" && "Request Submitted"}
                          {activity.type === "viewed" && "Viewed by Admin"}
                          {activity.type === "pending" && "Pending Review"}
                          {activity.type === "approved" && "Approved Review"}
                          {activity.type === "rejected" && "Request Rejected"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                        {activity.description && (
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* User Information Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Information</h2>
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-600">
                    {userInfo.name.charAt(0)}
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">{userInfo.name}</p>
                <p className="text-sm text-gray-500">{userInfo.membership}</p>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-900">{userInfo.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="text-sm text-gray-900">{userInfo.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm text-gray-900">{userInfo.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Join Date</p>
                  <p className="text-sm text-gray-900">{userInfo.joinDate}</p>
                </div>
              </div>
            </div>

            {/* User Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-base font-semibold text-gray-900">{userInfo.totalOrders}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-base font-semibold text-gray-900">{userInfo.totalSpent}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Refund Requests</p>
                  <p className="text-base font-semibold text-gray-900">{userInfo.refundRequests}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Account Status</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {userInfo.accountStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
