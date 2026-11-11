export interface ProductImageDTO {
  productImageId: number;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  primaryImage: boolean;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface ProductResponseDTO {
  productId: number;
  productName: string;
  sku: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  discount: number;
  specialPrice: number;
  quantity: number;
  status: ProductStatus;
  isReturnable: boolean;
  returnWindowDays?: number | null;
  categoryId: number;
  categoryName?: string;
  storeName?: string;
  images: ProductImageDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPageResponseDTO {
  content: ProductResponseDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface ProductCreateRequestDTO {
  categoryId: number;
  productName: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  price: number;
  discount?: number;
  quantity: number;
  isReturnable: boolean;
  returnWindowDays?: number;
}

export interface ProductUpdateRequestDTO {
  categoryId?: number;
  productName?: string;
  sku?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  discount?: number;
  quantity?: number;
  isReturnable?: boolean;
  returnWindowDays?: number;
}

export interface ProductStatusUpdateDTO {
  status: ProductStatus;
}

export interface ProductImageReorderDTO {
  imageIds: number[];
}

export interface ProductListParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'productId' | 'productName' | 'price' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}
