import { apiClient } from "./api";

export interface Product {
  id: string;
  title: string;
  description?: string;
  priceMinor: string;
  currency: string;
  status: string;
  stock?: number;
  media?: Array<{
    id: string;
    url: string;
    type: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
  }>;
  vendor?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category_id?: string;
  vendor_id?: string;
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

export const productApi = {
  getAll: async (
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      "/products",
      {
        params: filters,
      }
    );
    return response.data;
  },

  getById: async (
    id: string
  ): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getFeatured: async (
    limit: number = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      "/products/featured",
      {
        params: { limit },
      }
    );
    return response.data;
  },
};
