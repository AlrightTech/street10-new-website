import { apiClient } from "./api";
import axios from "axios";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  nickname?: string | null;
  profileImageUrl?: string | null;
  status: string;
  role: string;
  customerType?: string | null;
  lang?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Use proxy routes to avoid CORS issues
const proxyClient = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000,
});

// Add auth token interceptor for proxy client
proxyClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(error));
  }
);

export const userApi = {
  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await proxyClient.get<ApiResponse<{ user: User }>>("/api/proxy/users/me");
    if (response.data.success && response.data.data?.user) {
      // Update localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      return response.data.data.user;
    }
    throw new Error(response.data.message || "Failed to fetch user profile");
  },

  /**
   * Update current user profile
   */
  updateProfile: async (data: { phone?: string; lang?: string; profileImageUrl?: string }): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<{ user: User }>>("/users/me", data);
    if (response.data.success && response.data.data?.user) {
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    throw new Error(response.data.message || "Failed to update profile");
  },

  /**
   * Request customer verification
   */
  requestVerification: async (): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>("/users/me/verify");
    if (response.data.success && response.data.data?.user) {
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
      return response.data.data.user;
    }
    throw new Error(response.data.message || "Failed to request verification");
  },

  /**
   * Get current user's bidding history
   */
  getUserBids: async (params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      auctionId: string;
      userId: string;
      amountMinor: string;
      placedAt: string;
      isWinning: boolean;
      orderId?: string | null; // Order ID if bid won and order exists
      auction: {
        id: string;
        endAt: string;
        state: string;
        reservePrice?: string | null;
        winningBid?: {
          id: string;
          amountMinor: string;
          userId: string;
        } | null;
        product: {
          id: string;
          title: string;
          media: Array<{
            id: string;
            url: string;
            type: string;
          }>;
        };
      };
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const response = await proxyClient.get<ApiResponse<Array<any>>>("/api/proxy/users/me/bids", {
      params,
    });
    return response.data as any;
  },

  /**
   * Get active auction winner settlement (for winner banner)
   */
  getAuctionWinner: async (): Promise<{
    success: boolean;
    data: {
      winnerSettlement: {
        orderId: string;
        orderNumber: string;
        auctionId: string;
        productTitle: string;
        productImageUrl: string | null;
        paymentStage: string;
        settlementDueAt: string;
        downPaymentMinor: string;
        remainingPaymentMinor: string;
        totalMinor: string;
        timeRemaining: {
          days: number;
          hours: number;
          minutes: number;
          expired: boolean;
        };
      } | null;
    };
  }> => {
    const response = await proxyClient.get<ApiResponse<{ winnerSettlement: any }>>("/api/proxy/users/me/auction-winner");
    return response.data as any;
  },
};

