import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { CategoryListParams } from '../../../types/category.types';

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories(params?: CategoryListParams) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'list', params],
    queryFn: () => categoryService.listCategories(params),
    staleTime: 60_000,
  });
}

export function useCategory(categoryId: number | string | undefined) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, 'detail', categoryId],
    queryFn: () => {
      if (!categoryId) throw new Error('Category ID required');
      return categoryService.getCategoryById(categoryId);
    },
    enabled: Boolean(categoryId),
    staleTime: 60_000,
  });
}
