import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi, type Order, type OrderFilters } from "@/services/order.api";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchAll",
  async (filters?: OrderFilters) => {
    const response = await orderApi.getAll(filters);
    return response;
  }
);

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (filters?: OrderFilters) => {
    const response = await orderApi.getUserOrders(filters);
    return response;
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: string) => {
    const response = await orderApi.getById(id);
    return response.data.order;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.pagination = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch orders";
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user orders";
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch order";
      });
  },
});

export const { clearOrders, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
