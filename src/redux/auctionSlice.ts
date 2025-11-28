import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  auctionApi,
  type Auction,
  type AuctionFilters,
  type Bid,
} from "@/services/auction.api";

interface AuctionState {
  auctions: Auction[];
  featuredAuctions: Auction[];
  activeAuctions: Auction[];
  currentAuction: Auction | null;
  bids: Bid[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: AuctionState = {
  auctions: [],
  featuredAuctions: [],
  activeAuctions: [],
  currentAuction: null,
  bids: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchAuctions = createAsyncThunk(
  "auctions/fetchAll",
  async (filters?: AuctionFilters) => {
    const response = await auctionApi.getAll(filters);
    return response;
  }
);

export const fetchActiveAuctions = createAsyncThunk(
  "auctions/fetchActive",
  async (filters?: Omit<AuctionFilters, "state">) => {
    const response = await auctionApi.getActive(filters);
    return response;
  }
);

export const fetchAuctionById = createAsyncThunk(
  "auctions/fetchById",
  async (id: string) => {
    const response = await auctionApi.getById(id);
    return response.data.auction;
  }
);

export const fetchAuctionBids = createAsyncThunk(
  "auctions/fetchBids",
  async (auctionId: string) => {
    const response = await auctionApi.getBids(auctionId);
    return response.data.bids;
  }
);

export const placeBid = createAsyncThunk(
  "auctions/placeBid",
  async ({
    auctionId,
    amountMinor,
  }: {
    auctionId: string;
    amountMinor: number;
  }) => {
    const response = await auctionApi.placeBid(auctionId, { amountMinor });
    return response.data.bid;
  }
);

const auctionSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    clearAuctions: (state) => {
      state.auctions = [];
      state.pagination = null;
    },
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
      state.bids = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch auctions";
      })
      .addCase(fetchActiveAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.activeAuctions = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchActiveAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch active auctions";
      })
      .addCase(fetchAuctionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch auction";
      })
      .addCase(fetchAuctionBids.fulfilled, (state, action) => {
        state.bids = action.payload;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.bids = [action.payload, ...state.bids];
        if (state.currentAuction) {
          state.currentAuction.currentBid = {
            id: action.payload.id,
            amountMinor: action.payload.amountMinor,
            userId: action.payload.userId,
            createdAt: action.payload.createdAt,
          };
        }
      });
  },
});

export const { clearAuctions, clearCurrentAuction } = auctionSlice.actions;
export default auctionSlice.reducer;
