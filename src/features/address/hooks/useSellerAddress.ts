import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/addressService';
import { ApiClientError } from '../../../api/client';
import type {
  CountryResponseDTO,
  StateResponseDTO,
  DistrictResponseDTO,
  SellerAddressRequestDTO,
  SellerAddressResponseDTO,
} from '../../../types/address.types';

export const SELLER_ADDRESS_QUERY_KEY = ['seller', 'address'];
export const COUNTRIES_QUERY_KEY = ['locations', 'countries'];
export const STATES_QUERY_KEY = (countryId?: number | null) => ['locations', 'states', countryId];
export const DISTRICTS_QUERY_KEY = (stateId?: number | null) => ['locations', 'districts', stateId];

export function useSellerAddress() {
  const queryClient = useQueryClient();

  const {
    data: address,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SellerAddressResponseDTO | null, ApiClientError>({
    queryKey: SELLER_ADDRESS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await addressService.getSellerAddress();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          // 404 means no address recorded yet
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
    queryClient.invalidateQueries({ queryKey: SELLER_ADDRESS_QUERY_KEY });
  };

  const createMutation = useMutation<
    SellerAddressResponseDTO,
    ApiClientError,
    { dto: SellerAddressRequestDTO; countryId: number; stateId: number; districtId: number }
  >({
    mutationFn: ({ dto, countryId, stateId, districtId }) =>
      addressService.createSellerAddress(dto, countryId, stateId, districtId),
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_ADDRESS_QUERY_KEY, data);
      invalidate();
    },
  });

  const updateMutation = useMutation<
    SellerAddressResponseDTO,
    ApiClientError,
    { dto: SellerAddressRequestDTO; countryId: number; stateId: number; districtId: number }
  >({
    mutationFn: ({ dto, countryId, stateId, districtId }) =>
      addressService.updateSellerAddress(dto, countryId, stateId, districtId),
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_ADDRESS_QUERY_KEY, data);
      invalidate();
    },
  });

  return {
    address,
    hasAddress: Boolean(address),
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
  };
}

export function useLocationCatalog(countryId?: number | null, stateId?: number | null) {
  const { data: countries = [], isLoading: isLoadingCountries } = useQuery<CountryResponseDTO[]>({
    queryKey: COUNTRIES_QUERY_KEY,
    queryFn: addressService.getCountries,
    staleTime: 300_000,
  });

  const { data: states = [], isLoading: isLoadingStates } = useQuery<StateResponseDTO[]>({
    queryKey: STATES_QUERY_KEY(countryId),
    queryFn: () => (countryId ? addressService.getStatesByCountry(countryId) : Promise.resolve([])),
    enabled: Boolean(countryId),
    staleTime: 300_000,
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery<DistrictResponseDTO[]>({
    queryKey: DISTRICTS_QUERY_KEY(stateId),
    queryFn: () => (stateId ? addressService.getDistrictsByState(stateId) : Promise.resolve([])),
    enabled: Boolean(stateId),
    staleTime: 300_000,
  });

  return {
    countries,
    states,
    districts,
    isLoadingCountries,
    isLoadingStates,
    isLoadingDistricts,
  };
}
