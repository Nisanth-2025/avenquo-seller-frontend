export interface CategoryDTO {
  categoryId: number;
  categoryName: string;
  categoryImageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPageResponseDTO {
  content: CategoryDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface CategoryListParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'categoryId' | 'categoryName';
  sortOrder?: 'asc' | 'desc';
}
