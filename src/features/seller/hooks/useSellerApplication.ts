import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerService } from '../services/sellerService';
import { ApiClientError } from '../../../api/client';
import type {
  CreateSellerApplicationDTO,
  PatchSellerProfileDTO,
  SellerProfileResponseDTO,
  UpdateSellerApplicationDTO,
} from '../../../types/seller.types';

export const SELLER_APPLICATION_QUERY_KEY = ['seller', 'application'];

export function useSellerApplication() {
  const queryClient = useQueryClient();

  // Fetch current seller application
  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SellerProfileResponseDTO | null, ApiClientError>({
    queryKey: SELLER_APPLICATION_QUERY_KEY,
    queryFn: async () => {
      try {
        return await sellerService.getApplication();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          // 404 indicates user has not created an application yet
          return null;
        }
        throw err;
      }
    },
    retry: (failureCount, err) => {
      // Don't retry on 404 or 403
      if (err instanceof ApiClientError && (err.status === 404 || err.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 60_000,
  });

  // Invalidate helper
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SELLER_APPLICATION_QUERY_KEY });
  };

  // Create application draft
  const createMutation = useMutation<SellerProfileResponseDTO, ApiClientError, CreateSellerApplicationDTO>({
    mutationFn: sellerService.createApplication,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_APPLICATION_QUERY_KEY, data);
      invalidate();
    },
  });

  // Update application draft fields
  const updateMutation = useMutation<SellerProfileResponseDTO, ApiClientError, UpdateSellerApplicationDTO>({
    mutationFn: sellerService.updateApplication,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_APPLICATION_QUERY_KEY, data);
      invalidate();
    },
  });

  // Submit application
  const submitMutation = useMutation<SellerProfileResponseDTO, ApiClientError, void>({
    mutationFn: sellerService.submitApplication,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_APPLICATION_QUERY_KEY, data);
      invalidate();
    },
  });

  // Patch approved storefront profile
  const patchProfileMutation = useMutation<SellerProfileResponseDTO, ApiClientError, PatchSellerProfileDTO>({
    mutationFn: sellerService.patchProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_APPLICATION_QUERY_KEY, data);
      invalidate();
    },
  });

  // Upload logo
  const uploadLogoMutation = useMutation<string, ApiClientError, File>({
    mutationFn: sellerService.uploadLogo,
    onSuccess: () => {
      // Authoritative re-fetch per documentation
      refetch();
    },
  });

  // Upload banner
  const uploadBannerMutation = useMutation<string, ApiClientError, File>({
    mutationFn: sellerService.uploadBanner,
    onSuccess: () => {
      // Authoritative re-fetch per documentation
      refetch();
    },
  });

  // Delete logo
  const deleteLogoMutation = useMutation<string, ApiClientError, void>({
    mutationFn: sellerService.deleteLogo,
    onSuccess: () => {
      refetch();
    },
  });

  // Delete banner
  const deleteBannerMutation = useMutation<string, ApiClientError, void>({
    mutationFn: sellerService.deleteBanner,
    onSuccess: () => {
      refetch();
    },
  });

  const status = application?.status;
  const isDraft = status === 'DRAFT';
  const isChangesRequired = status === 'CHANGES_REQUIRED';
  const isEditable = !application || isDraft || isChangesRequired;
  const isSubmittedOrReview = status === 'SUBMITTED' || status === 'UNDER_REVIEW';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  return {
    application,
    hasApplication: Boolean(application),
    isLoading,
    isError,
    error,
    refetch,
    // Mutations
    createMutation,
    updateMutation,
    submitMutation,
    patchProfileMutation,
    uploadLogoMutation,
    uploadBannerMutation,
    deleteLogoMutation,
    deleteBannerMutation,
    // Status flags
    status,
    isDraft,
    isChangesRequired,
    isEditable,
    isSubmittedOrReview,
    isApproved,
    isRejected,
  };
}
