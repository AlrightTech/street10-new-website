import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryApi, type Category } from "@/services/category.api";

interface CategoryState {
  categories: Category[];
  categoryTree: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  loading: false,
  error: null,
};

export const fetchCategoryTree = createAsyncThunk(
  "categories/fetchTree",
  async () => {
    const response = await categoryApi.getTree();
    return response.data;
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string) => {
    const response = await categoryApi.getById(id);
    return response.data.category;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.categoryTree = [];
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTree = action.payload;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch category";
      });
  },
});

export const { clearCategories, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
