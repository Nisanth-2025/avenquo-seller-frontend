import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  CreateSellerApplicationDTO,
  PatchSellerProfileDTO,
  SellerProfileResponseDTO,
  UpdateSellerApplicationDTO,
} from '../../../types/seller.types';

export const sellerService = {
  /**
   * Create seller application draft
   * POST /api/v1/sellers/application
   */
  async createApplication(dto: CreateSellerApplicationDTO): Promise<SellerProfileResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerProfileResponseDTO>(
        API_ENDPOINTS.SELLERS.APPLICATION,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Read own seller application/profile
   * GET /api/v1/sellers/application
   */
  async getApplication(): Promise<SellerProfileResponseDTO> {
    try {
      const { data } = await apiAxios.get<SellerProfileResponseDTO>(
        API_ENDPOINTS.SELLERS.APPLICATION
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Replace draft application fields
   * PUT /api/v1/sellers/application
   */
  async updateApplication(dto: UpdateSellerApplicationDTO): Promise<SellerProfileResponseDTO> {
    try {
      const { data } = await apiAxios.put<SellerProfileResponseDTO>(
        API_ENDPOINTS.SELLERS.APPLICATION,
        dto
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Submit application for review
   * POST /api/v1/sellers/application/submit
   */
  async submitApplication(): Promise<SellerProfileResponseDTO> {
    try {
      const { data } = await apiAxios.post<SellerProfileResponseDTO>(
        API_ENDPOINTS.SELLERS.APPLICATION_SUBMIT
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Patch approved storefront profile fields (@ModelAttribute form data)
   * PATCH /api/v1/sellers/profile
   */
  async patchProfile(dto: PatchSellerProfileDTO): Promise<SellerProfileResponseDTO> {
    try {
      const formData = new FormData();
      if (dto.description !== undefined) formData.append('description', dto.description);
      if (dto.supportEmail !== undefined) formData.append('supportEmail', dto.supportEmail);
      if (dto.supportPhone !== undefined) formData.append('supportPhone', dto.supportPhone);
      if (dto.website !== undefined) formData.append('website', dto.website);

      const { data } = await apiAxios.patch<SellerProfileResponseDTO>(
        API_ENDPOINTS.SELLERS.PROFILE,
        formData
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Upload or replace logo (exact file part name: "logo")
   * PATCH /api/v1/sellers/profile/logo
   */
  async uploadLogo(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const { data } = await apiAxios.patch<string>(
        API_ENDPOINTS.SELLERS.PROFILE_LOGO,
        formData
      );
      return typeof data === 'string' ? data : JSON.stringify(data);
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Upload or replace banner (exact file part name: "banner")
   * PATCH /api/v1/sellers/profile/banner
   */
  async uploadBanner(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const { data } = await apiAxios.patch<string>(
        API_ENDPOINTS.SELLERS.PROFILE_BANNER,
        formData
      );
      return typeof data === 'string' ? data : JSON.stringify(data);
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete storefront logo
   * DELETE /api/v1/sellers/profile/logo
   */
  async deleteLogo(): Promise<string> {
    try {
      const { data } = await apiAxios.delete<string>(
        API_ENDPOINTS.SELLERS.PROFILE_LOGO
      );
      return typeof data === 'string' ? data : 'Logo deleted successfully';
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete storefront banner
   * DELETE /api/v1/sellers/profile/banner
   */
  async deleteBanner(): Promise<string> {
    try {
      const { data } = await apiAxios.delete<string>(
        API_ENDPOINTS.SELLERS.PROFILE_BANNER
      );
      return typeof data === 'string' ? data : 'Banner deleted successfully';
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
