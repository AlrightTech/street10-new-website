import { apiClient } from "./api";
import axios from "axios";

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  name?: string;
  email?: string;
  phone?: string;
  password: string;
  profileImageUrl?: string;
  provider?: "email" | "google" | "apple";
}

export interface OTPVerifyRequest {
  code: string;
  email?: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  code: string;
  newPassword: string;
  email?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name?: string | null;
      email: string;
      phone: string | null;
      role: string;
      status: string;
      lang?: string;
    };
    token: string;
    refreshToken?: string;
  };
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

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await proxyClient.post<AuthResponse>("/api/proxy/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await proxyClient.post<AuthResponse>("/api/proxy/auth/register", data);
    return response.data;
  },

  registerVendor: async (data: any): Promise<AuthResponse> => {
    const response = await proxyClient.post<AuthResponse>("/api/proxy/auth/register-vendor", data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/otp/verify",
      data
    );
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },
};
