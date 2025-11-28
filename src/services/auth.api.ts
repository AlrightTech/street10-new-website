import { apiClient } from "./api";

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
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
      email: string;
      phone: string | null;
      role: string;
      status: string;
    };
    token: string;
    refreshToken?: string;
  };
  message?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  registerVendor: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register-vendor", data);
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
