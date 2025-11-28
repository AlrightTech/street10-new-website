import { apiClient } from "./api";

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  user?: {
    id: string;
    email: string;
    phone: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VendorFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const vendorApi = {
  getAll: async (
    filters?: VendorFilters
  ): Promise<PaginatedResponse<Vendor>> => {
    const response = await apiClient.get<PaginatedResponse<Vendor>>(
      "/vendors",
      {
        params: filters,
      }
    );
    return response.data;
  },

  getById: async (
    id: string
  ): Promise<{ success: boolean; data: { vendor: Vendor } }> => {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data;
  },
};
