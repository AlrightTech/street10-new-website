import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  productApi,
  type Product,
  type ProductFilters,
} from "@/services/product.api";

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (filters?: ProductFilters) => {
    const response = await productApi.getAll(filters);
    return response;
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async (limit: number = 10) => {
    const response = await productApi.getFeatured(limit);
    return response;
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string) => {
    const response = await productApi.getById(id);
    return response.data.product;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProducts: (state) => {
      state.products = [];
      state.pagination = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch products";
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.data || [];
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch featured products";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch product";
      });
  },
});

export const { clearProducts, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
