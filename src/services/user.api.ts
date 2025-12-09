import { apiClient } from "./api";

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

export const userApi = {
  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>("/users/me");
    if (response.data.success && response.data.data?.user) {
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
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

