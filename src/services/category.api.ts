import { apiClient } from "./api";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  icon?: string;
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
};
