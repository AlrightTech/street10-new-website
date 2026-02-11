import { apiClient } from "./api";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
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
    vendor?: {
      id: string;
      name?: string;
      email: string;
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartResponse {
  success: boolean;
  data: {
    cart: Cart;
  };
}

export interface CartItemResponse {
  success: boolean;
  data: {
    item: CartItem;
  };
}

export interface CartCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get<CartResponse>("/cart");
    return response.data;
  },

  getCount: async (): Promise<CartCountResponse> => {
    const response = await apiClient.get<CartCountResponse>("/cart/count");
    return response.data;
  },

  addItem: async (
    productId: string,
    quantity: number
  ): Promise<CartItemResponse> => {
    const response = await apiClient.post<CartItemResponse>("/cart/items", {
      productId,
      quantity,
    });
    return response.data;
  },

  updateItem: async (
    itemId: string,
    quantity: number
  ): Promise<CartItemResponse> => {
    const response = await apiClient.patch<CartItemResponse>(
      `/cart/items/${itemId}`,
      {
        quantity,
      }
    );
    return response.data;
  },

  removeItem: async (itemId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<{ success: boolean }> => {
    const response = await apiClient.delete("/cart");
    return response.data;
  },
};
