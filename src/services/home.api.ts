import { apiClient } from "./api";
import type {
  Auction,
  PaginatedResponse as AuctionPaginatedResponse,
} from "./auction.api";
import type {
  Product,
  PaginatedResponse as ProductPaginatedResponse,
} from "./product.api";

export const homeApi = {
  getFeaturedAuctions: async (
    limit: number = 10
  ): Promise<AuctionPaginatedResponse<Auction>> => {
    const response = await apiClient.get<AuctionPaginatedResponse<Auction>>(
      "/home/featured-auctions",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  getFeaturedProducts: async (
    limit: number = 10
  ): Promise<ProductPaginatedResponse<Product>> => {
    const response = await apiClient.get<ProductPaginatedResponse<Product>>(
      "/home/featured-products",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  getVendorOfferings: async (
    limit: number = 10
  ): Promise<ProductPaginatedResponse<Product>> => {
    const response = await apiClient.get<ProductPaginatedResponse<Product>>(
      "/home/vendor-products",
      {
        params: { limit },
      }
    );
    return response.data;
  },

  getStoryHighlights: async (limit: number = 20) => {
    const response = await apiClient.get<{
      data: Array<{
        id: string;
        title: string;
        thumbnailUrl: string | null;
        mediaUrls: string[];
        type: 'image' | 'video';
        url: string | null;
        startDate: string;
        endDate: string;
        audience: 'user' | 'vendor';
        priority: 'high' | 'medium' | 'low';
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>("/home/story-highlights", {
      params: { limit },
    });
    return response.data;
  },
};
