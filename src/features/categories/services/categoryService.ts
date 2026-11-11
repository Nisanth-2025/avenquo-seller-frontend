import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  CategoryDTO,
  CategoryPageResponseDTO,
  CategoryListParams,
} from '../../../types/category.types';

export const categoryService = {
  /**
   * List active categories (paged).
   * GET /api/v1/categories
   */
  async listCategories(params?: CategoryListParams): Promise<CategoryPageResponseDTO> {
    try {
      const response = await apiAxios.get<CategoryPageResponseDTO>(API_ENDPOINTS.CATEGORIES.LIST, {
        params: {
          pageNumber: params?.pageNumber ?? 0,
          pageSize: params?.pageSize ?? 50,
          sortBy: params?.sortBy ?? 'categoryId',
          sortOrder: params?.sortOrder ?? 'asc',
        },
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Get one active category by ID.
   * GET /api/v1/categories/{categoryId}
   */
  async getCategoryById(categoryId: number | string): Promise<CategoryDTO> {
    try {
      const response = await apiAxios.get<CategoryDTO>(
        API_ENDPOINTS.CATEGORIES.BY_ID(categoryId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
