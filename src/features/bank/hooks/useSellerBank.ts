import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankService } from '../services/bankService';
import { ApiClientError } from '../../../api/client';
import type {
  SellerBankDetailsRequestDTO,
  SellerBankDetailsResponseDTO,
} from '../../../types/bank.types';

export const SELLER_BANK_QUERY_KEY = ['seller', 'bank-details'];

export function useSellerBank() {
  const queryClient = useQueryClient();

  const {
    data: bankDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SellerBankDetailsResponseDTO | null, ApiClientError>({
    queryKey: SELLER_BANK_QUERY_KEY,
    queryFn: async () => {
      try {
        return await bankService.getBankDetails();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          // 404 means no bank details recorded yet
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
    queryClient.invalidateQueries({ queryKey: SELLER_BANK_QUERY_KEY });
  };

  const createMutation = useMutation<
    SellerBankDetailsResponseDTO,
    ApiClientError,
    SellerBankDetailsRequestDTO
  >({
    mutationFn: bankService.createBankDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_BANK_QUERY_KEY, data);
      invalidate();
    },
  });

  const updateMutation = useMutation<
    SellerBankDetailsResponseDTO,
    ApiClientError,
    SellerBankDetailsRequestDTO
  >({
    mutationFn: bankService.updateBankDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_BANK_QUERY_KEY, data);
      invalidate();
    },
  });

  const submitMutation = useMutation<
    SellerBankDetailsResponseDTO,
    ApiClientError,
    void
  >({
    mutationFn: bankService.submitBankDetails,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_BANK_QUERY_KEY, data);
      invalidate();
    },
  });

  const status = bankDetails?.verificationStatus;
  const isDraft = status === 'DRAFT';
  const isSubmitted = status === 'SUBMITTED';
  const isUnderReview = status === 'UNDER_REVIEW';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  const canEdit = !bankDetails || isDraft || isRejected;
  const canSubmit = Boolean(bankDetails) && (isDraft || isRejected);

  return {
    bankDetails,
    hasBankDetails: Boolean(bankDetails),
    status,
    isLoading,
    isError,
    error,
    refetch,
    isDraft,
    isSubmitted,
    isUnderReview,
    isApproved,
    isRejected,
    canEdit,
    canSubmit,
    createMutation,
    updateMutation,
    submitMutation,
  };
}
