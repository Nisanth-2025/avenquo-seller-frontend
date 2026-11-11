import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  SellerTaxRequestDTO,
  SellerTaxResponseDTO,
  SellerTaxUpdateRequestDTO,
} from '../../../types/tax.types';

export const taxService = {
  /**
   * Create tax details
   * POST /api/v1/sellers/tax
   */
  async createTaxDetails(dto: SellerTaxRequestDTO): Promise<SellerTaxResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerTaxResponseDTO>(
        API_ENDPOINTS.SELLERS.TAX,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Read tax details
   * GET /api/v1/sellers/tax
   */
  async getTaxDetails(): Promise<SellerTaxResponseDTO> {
    try {
      const { data } = await apiAxios.get<SellerTaxResponseDTO>(
        API_ENDPOINTS.SELLERS.TAX
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update tax details in draft status
   * PUT /api/v1/sellers/tax
   */
  async updateTaxDetails(dto: SellerTaxUpdateRequestDTO): Promise<SellerTaxResponseDTO> {
    try {
      const { data } = await apiAxios.put<SellerTaxResponseDTO>(
        API_ENDPOINTS.SELLERS.TAX,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Submit tax details for verification
   * POST /api/v1/sellers/tax/submit
   */
  async submitTaxDetails(): Promise<SellerTaxResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerTaxResponseDTO>(
        API_ENDPOINTS.SELLERS.TAX_SUBMIT
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
