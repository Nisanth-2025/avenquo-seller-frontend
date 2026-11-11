import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxService } from '../services/taxService';
import { ApiClientError } from '../../../api/client';
import type {
  SellerTaxRequestDTO,
  SellerTaxResponseDTO,
  SellerTaxUpdateRequestDTO,
} from '../../../types/tax.types';

export const SELLER_TAX_QUERY_KEY = ['seller', 'tax'];

export function useSellerTax() {
  const queryClient = useQueryClient();

  const {
    data: taxDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SellerTaxResponseDTO | null, ApiClientError>({
    queryKey: SELLER_TAX_QUERY_KEY,
    queryFn: async () => {
      try {
        return await taxService.getTaxDetails();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          // 404 indicates no tax details have been created yet
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, err) => {
      if (err instanceof ApiClientError && (err.status === 404 || err.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SELLER_TAX_QUERY_KEY });
  };

  const createMutation = useMutation<SellerTaxResponseDTO, ApiClientError, SellerTaxRequestDTO>({
    mutationFn: taxService.createTaxDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_TAX_QUERY_KEY, data);
      invalidate();
    },
  });

  const updateMutation = useMutation<SellerTaxResponseDTO, ApiClientError, SellerTaxUpdateRequestDTO>({
    mutationFn: taxService.updateTaxDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_TAX_QUERY_KEY, data);
      invalidate();
    },
  });

  const submitMutation = useMutation<SellerTaxResponseDTO, ApiClientError, void>({
    mutationFn: taxService.submitTaxDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_TAX_QUERY_KEY, data);
      invalidate();
    },
  });

  return {
    taxDetails,
    hasTaxDetails: Boolean(taxDetails),
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    submitMutation,
  };
}
