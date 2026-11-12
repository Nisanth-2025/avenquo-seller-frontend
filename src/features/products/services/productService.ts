import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  ProductResponseDTO,
  ProductPageResponseDTO,
  ProductCreateRequestDTO,
  ProductUpdateRequestDTO,
  ProductStatus,
  ProductListParams,
} from '../../../types/product.types';

export const productService = {
  /**
   * List seller's own products (paged).
   * GET /api/v1/seller/products
   */
  async listProducts(params?: ProductListParams): Promise<ProductPageResponseDTO> {
    try {
      const response = await apiAxios.get<ProductPageResponseDTO>(API_ENDPOINTS.PRODUCTS.BASE, {
        params: {
          pageNumber: params?.pageNumber ?? 0,
          pageSize: params?.pageSize ?? 50,
          sortBy: params?.sortBy ?? 'createdAt',
          sortOrder: params?.sortOrder ?? 'desc',
        },
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Get single seller product by ID.
   * GET /api/v1/seller/products/{productId}
   */
  async getProductById(productId: number | string): Promise<ProductResponseDTO> {
    try {
      const response = await apiAxios.get<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.BY_ID(productId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Create product with 1-5 images.
   * POST /api/v1/seller/products
   * Uses multipart/form-data with JSON part 'product' and file parts 'images'
   */
  async createProduct(
    product: ProductCreateRequestDTO,
    images: File[]
  ): Promise<ProductResponseDTO> {
    try {
      const formData = new FormData();
      const productBlob = new Blob([JSON.stringify(product)], { type: 'application/json' });
      formData.append('product', productBlob);

      images.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiAxios.post<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.BASE,
        formData
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete a seller product.
   * DELETE /api/v1/seller/products/{productId}
   */
  async deleteProduct(productId: number | string): Promise<void> {
    try {
      await apiAxios.delete(API_ENDPOINTS.PRODUCTS.BY_ID(productId));
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update product fields.
   * PUT /api/v1/seller/products/{productId}
   */
  async updateProduct(
    productId: number | string,
    data: ProductUpdateRequestDTO
  ): Promise<ProductResponseDTO> {
    try {
      const response = await apiAxios.put<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.BY_ID(productId),
        data
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Set product status (ACTIVE or INACTIVE).
   * PATCH /api/v1/seller/products/{productId}/status
   */
  async updateProductStatus(
    productId: number | string,
    status: ProductStatus
  ): Promise<ProductResponseDTO> {
    try {
      const response = await apiAxios.patch<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.STATUS(productId),
        { status }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Add 1 or more images to product (up to 5 total).
   * POST /api/v1/seller/products/{productId}/images
   */
  async addProductImages(
    productId: number | string,
    images: File[]
  ): Promise<ProductResponseDTO> {
    try {
      const formData = new FormData();
      images.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiAxios.post<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.IMAGES(productId),
        formData
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Replace one specific image.
   * PUT /api/v1/seller/products/{productId}/images/{imageId}
   */
  async replaceProductImage(
    productId: number | string,
    imageId: number | string,
    image: File
  ): Promise<ProductResponseDTO> {
    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await apiAxios.put<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.IMAGE_BY_ID(productId, imageId),
        formData
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete one image from product (product must retain at least 1 image).
   * DELETE /api/v1/seller/products/{productId}/images/{imageId}
   */
  async deleteProductImage(
    productId: number | string,
    imageId: number | string
  ): Promise<ProductResponseDTO> {
    try {
      const response = await apiAxios.delete<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.IMAGE_BY_ID(productId, imageId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Choose primary image for product.
   * PATCH /api/v1/seller/products/{productId}/images/{imageId}/primary
   */
  async setPrimaryProductImage(
    productId: number | string,
    imageId: number | string
  ): Promise<ProductResponseDTO> {
    try {
      const response = await apiAxios.patch<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.IMAGE_PRIMARY(productId, imageId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Reorder all images for product.
   * PUT /api/v1/seller/products/{productId}/images/reorder
   */
  async reorderProductImages(
    productId: number | string,
    imageIds: number[]
  ): Promise<ProductResponseDTO> {
    try {
      const response = await apiAxios.put<ProductResponseDTO>(
        API_ENDPOINTS.PRODUCTS.IMAGES_REORDER(productId),
        { imageIds }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
