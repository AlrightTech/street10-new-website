import { apiClient } from "./api";
import axios from "axios";

export interface KYCSubmission {
  id: string;
  userId: string;
  status: string;
  docsUrls: {
    cnicFront?: string | null;
    cnicBack?: string | null;
  };
  reviewedBy?: string | null;
  reason?: string | null;
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

export const kycApi = {
  /**
   * Submit KYC documents (CNIC front and back)
   */
  submitKYC: async (docsUrls: string[]): Promise<{ submissionId: string; status: string; message: string }> => {
    const response = await proxyClient.post<ApiResponse<{ submissionId: string; status: string; message: string }>>(
      "/api/proxy/kyc/submit",
      { docsUrls }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to submit KYC documents");
  },

  /**
   * Get current user's KYC status
   */
  getKYCStatus: async (): Promise<{ kyc: KYCSubmission | null }> => {
    const response = await proxyClient.get<ApiResponse<{ kyc: KYCSubmission | null }>>("/api/proxy/kyc/status");
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch KYC status");
  },
};

