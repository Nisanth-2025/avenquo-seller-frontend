import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  SellerBankDetailsRequestDTO,
  SellerBankDetailsResponseDTO,
} from '../../../types/bank.types';

export const bankService = {
  /**
   * Create bank details
   * POST /api/v1/sellers/bank-details
   */
  async createBankDetails(
    dto: SellerBankDetailsRequestDTO
  ): Promise<SellerBankDetailsResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerBankDetailsResponseDTO>(
        API_ENDPOINTS.SELLERS.BANK,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Read bank details
   * GET /api/v1/sellers/bank-details
   */
  async getBankDetails(): Promise<SellerBankDetailsResponseDTO> {
    try {
      const { data } = await apiAxios.get<SellerBankDetailsResponseDTO>(
        API_ENDPOINTS.SELLERS.BANK
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Replace bank details in DRAFT or REJECTED status
   * PUT /api/v1/sellers/bank-details
   */
  async updateBankDetails(
    dto: SellerBankDetailsRequestDTO
  ): Promise<SellerBankDetailsResponseDTO> {
    try {
      const { data } = await apiAxios.put<SellerBankDetailsResponseDTO>(
        API_ENDPOINTS.SELLERS.BANK,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Submit bank details for compliance verification
   * POST /api/v1/sellers/bank-details/submit
   */
  async submitBankDetails(): Promise<SellerBankDetailsResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerBankDetailsResponseDTO>(
        API_ENDPOINTS.SELLERS.BANK_SUBMIT
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
