import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import {
  ProductListParams,
  ProductCreateRequestDTO,
  ProductUpdateRequestDTO,
  ProductStatus,
} from '../../../types/product.types';

export const PRODUCTS_QUERY_KEY = ['seller_products'];

export function useSellerProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'list', params],
    queryFn: () => productService.listProducts(params),
    staleTime: 30_000,
  });
}

export function useSellerProduct(productId: number | string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID required');
      return productService.getProductById(productId);
    },
    enabled: Boolean(productId),
    staleTime: 30_000,
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidate = (productId?: number | string) => {
    queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    if (productId) {
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, 'detail', productId],
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ product, images }: { product: ProductCreateRequestDTO; images: File[] }) =>
      productService.createProduct(product, images),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number | string;
      data: ProductUpdateRequestDTO;
    }) => productService.updateProduct(productId, data),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: number | string) => productService.deleteProduct(productId),
    onSuccess: (_data, productId) => {
      queryClient.removeQueries({ queryKey: [...PRODUCTS_QUERY_KEY, 'detail', productId] });
      invalidate();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      productId,
      status,
    }: {
      productId: number | string;
      status: ProductStatus;
    }) => productService.updateProductStatus(productId, status),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const addImagesMutation = useMutation({
    mutationFn: ({
      productId,
      images,
    }: {
      productId: number | string;
      images: File[];
    }) => productService.addProductImages(productId, images),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const replaceImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
      image,
    }: {
      productId: number | string;
      imageId: number | string;
      image: File;
    }) => productService.replaceProductImage(productId, imageId, image),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: number | string;
      imageId: number | string;
    }) => productService.deleteProductImage(productId, imageId),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: number | string;
      imageId: number | string;
    }) => productService.setPrimaryProductImage(productId, imageId),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  const reorderImagesMutation = useMutation({
    mutationFn: ({
      productId,
      imageIds,
    }: {
      productId: number | string;
      imageIds: number[];
    }) => productService.reorderProductImages(productId, imageIds),
    onSuccess: (data) => {
      invalidate(data.productId);
    },
  });

  return {
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteProductMutation,
    addImagesMutation,
    replaceImageMutation,
    deleteImageMutation,
    setPrimaryImageMutation,
    reorderImagesMutation,
  };
}
