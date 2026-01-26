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
    limit: number = 10,
    filters?: {
      categoryId?: string;
      subcategoryId?: string;
      filterValues?: Array<{ filterId: string; value: string }>;
    }
  ): Promise<AuctionPaginatedResponse<Auction>> => {
    const params: any = { limit };
    if (filters?.categoryId) params.category_id = filters.categoryId;
    if (filters?.subcategoryId) params.subcategory_id = filters.subcategoryId;
    if (filters?.filterValues && filters.filterValues.length > 0) {
      // Convert filter values to JSON string
      const filterObj: Record<string, string> = {};
      filters.filterValues.forEach(fv => {
        filterObj[fv.filterId] = fv.value;
      });
      params.filters = JSON.stringify(filterObj);
    }
    
    const response = await apiClient.get<AuctionPaginatedResponse<Auction>>(
      "/home/featured-auctions",
      {
        params,
        timeout: 60000, // 60 seconds timeout for home endpoints
      }
    );
    return response.data;
  },

  getFeaturedProducts: async (
    limit: number = 10,
    filters?: {
      categoryId?: string;
      subcategoryId?: string;
      filterValues?: Array<{ filterId: string; value: string }>;
    }
  ): Promise<ProductPaginatedResponse<Product>> => {
    const params: any = { limit };
    if (filters?.categoryId) params.category_id = filters.categoryId;
    if (filters?.subcategoryId) params.subcategory_id = filters.subcategoryId;
    if (filters?.filterValues && filters.filterValues.length > 0) {
      const filterObj: Record<string, string> = {};
      filters.filterValues.forEach(fv => {
        filterObj[fv.filterId] = fv.value;
      });
      params.filters = JSON.stringify(filterObj);
    }
    
    const response = await apiClient.get<ProductPaginatedResponse<Product>>(
      "/home/featured-products",
      {
        params,
        timeout: 60000, // 60 seconds timeout for home endpoints
      }
    );
    return response.data;
  },

  getVendorOfferings: async (
    limit: number = 10,
    filters?: {
      categoryId?: string;
      subcategoryId?: string;
      filterValues?: Array<{ filterId: string; value: string }>;
    }
  ): Promise<ProductPaginatedResponse<Product>> => {
    const params: any = { limit };
    if (filters?.categoryId) params.category_id = filters.categoryId;
    if (filters?.subcategoryId) params.subcategory_id = filters.subcategoryId;
    if (filters?.filterValues && filters.filterValues.length > 0) {
      const filterObj: Record<string, string> = {};
      filters.filterValues.forEach(fv => {
        filterObj[fv.filterId] = fv.value;
      });
      params.filters = JSON.stringify(filterObj);
    }
    
    const response = await apiClient.get<ProductPaginatedResponse<Product>>(
      "/home/vendor-products",
      {
        params,
        timeout: 60000, // 60 seconds timeout for home endpoints
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
      timeout: 60000, // 60 seconds timeout for home endpoints
    });
    return response.data;
  },

  getBanners: async (limit: number = 10) => {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{
        id: string;
        title: string;
        subtitle: string | null;
        description: string | null;
        thumbnailUrl: string | null;
        mediaUrls: string[];
        type: 'image' | 'video';
        url: string | null;
        buttonText: string | null;
        buttonLink: string | null;
        startDate: string;
        endDate: string;
        audience: 'user' | 'vendor';
        priority: 'high' | 'medium' | 'low';
      }>;
    }>("/home/banners", {
      params: { limit },
      timeout: 60000,
    });
    return response.data.data || [];
  },

  getPopups: async (device?: 'desktop' | 'mobile') => {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{
        id: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
        redirectType: 'product' | 'category' | 'external';
        redirectTarget: string | null;
        ctaText: string | null;
        startDate: string;
        endDate: string;
        priority: 'high' | 'medium' | 'low';
        deviceTarget: 'desktop' | 'mobile' | 'both';
      }>;
    }>("/home/popups", {
      params: device ? { device } : {},
      timeout: 60000,
    });
    return response.data.data || [];
  },
};
