import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  CountryResponseDTO,
  StateResponseDTO,
  DistrictResponseDTO,
  SellerAddressRequestDTO,
  SellerAddressResponseDTO,
} from '../../../types/address.types';

export const addressService = {
  // ── Location Catalog Methods ──
  async getCountries(): Promise<CountryResponseDTO[]> {
    try {
      const { data } = await apiAxios.get<CountryResponseDTO[]>(
        API_ENDPOINTS.LOCATIONS.COUNTRIES
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async getStatesByCountry(countryId: number | string): Promise<StateResponseDTO[]> {
    try {
      const { data } = await apiAxios.get<StateResponseDTO[]>(
        API_ENDPOINTS.LOCATIONS.STATES_BY_COUNTRY(countryId)
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async getDistrictsByState(stateId: number | string): Promise<DistrictResponseDTO[]> {
    try {
      const { data } = await apiAxios.get<DistrictResponseDTO[]>(
        API_ENDPOINTS.LOCATIONS.DISTRICTS_BY_STATE(stateId)
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  // ── Seller Address Methods ──
  /**
   * Create seller address
   * POST /api/v1/sellers/address/{countryId}/{stateId}/{districtId}
   */
  async createSellerAddress(
    dto: SellerAddressRequestDTO,
    countryId: number,
    stateId: number,
    districtId: number
  ): Promise<SellerAddressResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerAddressResponseDTO>(
        `${API_ENDPOINTS.SELLERS.ADDRESS}/${countryId}/${stateId}/${districtId}`,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Read own seller address
   * GET /api/v1/sellers/address
   */
  async getSellerAddress(): Promise<SellerAddressResponseDTO> {
    try {
      const { data } = await apiAxios.get<SellerAddressResponseDTO>(
        API_ENDPOINTS.SELLERS.ADDRESS
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update seller address
   * PUT /api/v1/sellers/address/{countryId}/{stateId}/{districtId}
   */
  async updateSellerAddress(
    dto: SellerAddressRequestDTO,
    countryId: number,
    stateId: number,
    districtId: number
  ): Promise<SellerAddressResponseDTO> {
    try {
      const { data } = await apiAxios.put<SellerAddressResponseDTO>(
        `${API_ENDPOINTS.SELLERS.ADDRESS}/${countryId}/${stateId}/${districtId}`,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
