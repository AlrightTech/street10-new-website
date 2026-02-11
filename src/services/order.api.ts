import { apiClient } from "./api";

export interface ShippingAddress {
  country?: string;
  city?: string;
  zone?: string;
  street?: string;
  building?: string;
  homeOffice?: string;
  phone?: string;
  instructions?: string;
  state?: string;
  zipCode?: string;
  // Allow additional fields, but keep them stringly-typed for form inputs.
  [key: string]: string | undefined;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  orderNumber: string;
  totalMinor: string;
  remainingPayment?: string; // Remaining payment after deposit is applied (for auction orders)
  currency: string;
  status: string;
  paymentMethod: string;
  shippingAddress?: ShippingAddress;
  auctionId?: string; // For auction orders
  paymentStage?: string; // For auction orders: down_payment_required, final_payment_required, full_payment_required, fully_paid
  downPaymentMinor?: string; // For auction orders
  remainingPaymentMinor?: string; // For auction orders
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
    vendorId?: string;
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    couponCode?: string;
  }): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await apiClient.post("/orders", data);
    return response.data;
  },

  updateAddress: async (
    orderId: string,
    shippingAddress: ShippingAddress
  ): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await apiClient.patch(`/orders/${orderId}/address`, {
      shippingAddress,
    });
    return response.data;
  },

  completePayment: async (
    orderId: string
  ): Promise<{ success: boolean; data: { order: Order } }> => {
    const response = await apiClient.post(`/orders/${orderId}/complete-payment`);
    return response.data;
  },

  // Auction order payment endpoints
  payDownPayment: async (
    orderId: string
  ): Promise<{ success: boolean; data: { paymentIntent: { clientSecret: string; paymentIntentId: string; amountMinor: string } } }> => {
    const response = await apiClient.post(`/orders/${orderId}/pay-down-payment`);
    return response.data;
  },

  payFinalPayment: async (
    orderId: string
  ): Promise<{ success: boolean; data: { paymentIntent: { clientSecret: string; paymentIntentId: string; amountMinor: string } } }> => {
    const response = await apiClient.post(`/orders/${orderId}/pay-final-payment`);
    return response.data;
  },

  payFullPayment: async (
    orderId: string
  ): Promise<{ success: boolean; data: { paymentIntent: { clientSecret: string; paymentIntentId: string; amountMinor: string } } }> => {
    const response = await apiClient.post(`/orders/${orderId}/pay-full-payment`);
    return response.data;
  },
};
