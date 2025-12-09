import { apiClient } from "./api";
import axios from "axios";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
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
  updateProfile: async (data: { phone?: string; lang?: string }): Promise<User> => {
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
};

