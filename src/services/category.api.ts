import { apiClient } from "./api";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  icon?: string;
  langData?: any; // JSON field from backend containing localized data (e.g., { en: { iconUrl: string } })
  children?: Category[];
}

export interface CategoryTreeResponse {
  success: boolean;
  data: Category[];
}

export const categoryApi = {
  getTree: async (): Promise<CategoryTreeResponse> => {
    const response = await apiClient.get<CategoryTreeResponse>(
      "/categories/tree"
    );
    return response.data;
  },

  getById: async (
    id: string
  ): Promise<{ success: boolean; data: { category: Category } }> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Get only main categories (categories with no parent)
  getMain: async (): Promise<{ success: boolean; data: { categories: Category[] } }> => {
    const response = await apiClient.get<{ success: boolean; data: { categories: Category[] } }>("/categories/main");
    return response.data;
  },

  // Get subcategories of a category
  getSubcategories: async (parentId: string): Promise<{ success: boolean; data: { subcategories: Category[] } }> => {
    const response = await apiClient.get<{ success: boolean; data: { subcategories: Category[] } }>(`/categories/${parentId}/subcategories`);
    return response.data;
  },

  // Get categories that have products (for category tabs)
  getWithProducts: async (productType: 'bidding' | 'ecommerce' | 'vendor' | 'all' = 'all'): Promise<{ success: boolean; data: { categories: Category[] } }> => {
    const response = await apiClient.get<{ success: boolean; data: { categories: Category[] } }>("/categories/with-products", {
      params: { productType },
    });
    return response.data;
  },

  // Get filters for a category (using public endpoint)
  getCategoryFilters: async (categoryId: string): Promise<{ success: boolean; data: { filters: any[] } }> => {
    const response = await apiClient.get<{ success: boolean; data: { filters: any[] } }>(`/public/categories/${categoryId}/filters`);
    return response.data;
  },
};
