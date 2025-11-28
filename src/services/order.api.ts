import { apiClient } from "./api";

export interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  [key: string]: unknown;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  orderNumber: string;
  totalMinor: string;
  currency: string;
  status: string;
  paymentMethod: string;
  shippingAddress?: ShippingAddress;
  items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    priceMinor: string;
    product?: {
      id: string;
      title: string;
      media?: Array<{
        id: string;
        url: string;
        type: string;
      }>;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
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

export const orderApi = {
  getAll: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>("/orders", {
      params: filters,
    });
    return response.data;
  },

  getById: async (
    id: string
  ): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  getUserOrders: async (
    filters?: OrderFilters
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      "/users/me/orders",
      {
        params: filters,
      }
    );
    return response.data;
  },

  create: async (data: {
    vendorId: string;
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    couponCode?: string;
  }): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await apiClient.post("/orders", data);
    return response.data;
  },
};
