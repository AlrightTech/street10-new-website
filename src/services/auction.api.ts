import { apiClient } from "./api";

export interface Auction {
  id: string;
  productId: string;
  type: string;
  state: string;
  startAt: string;
  endAt: string;
  reservePrice?: string;
  minIncrement?: string;
  depositAmount?: string;
  buyNowPrice?: string;
  product?: {
    id: string;
    title: string;
    description?: string;
    media?: Array<{
      id: string;
      url: string;
      type: string;
    }>;
    documents?: Array<{
      id: string;
      url: string;
      title: string;
      displayOrder: number;
    }>;
    filterValues?: Array<{
      id: string;
      filterId: string;
      value: string;
      filter: {
        id: string;
        key: string;
        type: string;
        iconUrl?: string;
        i18n?: {
          en?: { label: string };
          ar?: { label: string };
        };
      };
    }>;
  };
  currentBid?: {
    id: string;
    amountMinor: string;
    userId: string;
    createdAt: string;
  };
  winningBid?: {
    id: string;
    amountMinor: string;
    userId: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amountMinor: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface AuctionFilters {
  state?: string;
  type?: string;
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

export interface PlaceBidRequest {
  amountMinor: number;
}

export const auctionApi = {
  getAll: async (
    filters?: AuctionFilters
  ): Promise<PaginatedResponse<Auction>> => {
    const response = await apiClient.get<PaginatedResponse<Auction>>(
      "/auctions",
      {
        params: filters,
      }
    );
    return response.data;
  },

  getById: async (
    id: string
  ): Promise<{ success: boolean; data: { auction: Auction } }> => {
    const response = await apiClient.get(`/auctions/${id}`);
    return response.data;
  },

  getActive: async (
    filters?: Omit<AuctionFilters, "state">
  ): Promise<PaginatedResponse<Auction>> => {
    const response = await apiClient.get<PaginatedResponse<Auction>>(
      "/auctions/active",
      {
        params: { ...filters, state: "active" },
      }
    );
    return response.data;
  },

  getBids: async (
    auctionId: string
  ): Promise<{ success: boolean; data: { bids: Bid[] } }> => {
    const response = await apiClient.get(`/auctions/${auctionId}/bids`);
    return response.data;
  },

  placeBid: async (
    auctionId: string,
    data: PlaceBidRequest
  ): Promise<{ success: boolean; data: { bid: Bid } }> => {
    const response = await apiClient.post(`/auctions/${auctionId}/bid`, data);
    return response.data;
  },
};
