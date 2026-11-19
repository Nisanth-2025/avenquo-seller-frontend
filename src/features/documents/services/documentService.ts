import { apiAxios, extractApiError, getOrRefreshToken, rotateRefreshToken, ApiClientError } from '../../../api/client';
import { tokenStorage } from '../../../utils/tokenStorage';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  DocumentType,
  SellerDocumentResponseDTO,
  SellerDocumentViewResponseDTO,
} from '../../../types/document.types';

export const documentService = {
  /**
   * Upload a verification document
   * POST /api/v1/sellers/documents
   * multipart/form-data with 'document' and 'documentType'
   */
  async uploadDocument(file: File, documentType: DocumentType): Promise<SellerDocumentResponseDTO> {
    try {
      let token = await getOrRefreshToken();

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const baseUrl = apiAxios.defaults.baseURL || '';
      const url = `${baseUrl}${API_ENDPOINTS.SELLERS.DOCUMENTS}`;

      let response = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      // Handle 401 token refresh retry if clock drift occurred
      if (response.status === 401) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          const newTokens = await rotateRefreshToken(refreshToken);
          if (newTokens?.accessToken) {
            token = newTokens.accessToken;
            response = await fetch(url, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = 'The document could not be uploaded. Check your connection and try again.';
        let fieldErrors: Record<string, string> | undefined = undefined;

        if (errorData) {
          if (typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (typeof errorData === 'object') {
            const errs: Record<string, string> = {};
            let first = '';
            for (const [k, v] of Object.entries(errorData)) {
              if (typeof v === 'string') {
                errs[k] = v;
                if (!first) first = v;
              }
            }
            if (first) {
              errorMessage = first;
              fieldErrors = errs;
            }
          }
        }
        throw new ApiClientError(errorMessage, response.status, fieldErrors);
      }

      const data: SellerDocumentResponseDTO = await response.json();
      return data;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw extractApiError(err);
    }
  },

  /**
   * List all documents for the authenticated seller
   * GET /api/v1/sellers/documents
   */
  async getAllDocuments(): Promise<SellerDocumentResponseDTO[]> {
    try {
      const { data } = await apiAxios.get<SellerDocumentResponseDTO[]>(
        API_ENDPOINTS.SELLERS.DOCUMENTS
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Retrieve document metadata with temporary signed URL (valid 15m)
   * GET /api/v1/sellers/documents/{documentId}
   */
  async getDocumentById(documentId: number | string): Promise<SellerDocumentViewResponseDTO> {
    try {
      const { data } = await apiAxios.get<SellerDocumentViewResponseDTO>(
        `${API_ENDPOINTS.SELLERS.DOCUMENTS}/${documentId}`
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete a draft document
   * DELETE /api/v1/sellers/documents/{documentId}
   */
  async deleteDocument(documentId: number | string): Promise<void> {
    try {
      await apiAxios.delete(`${API_ENDPOINTS.SELLERS.DOCUMENTS}/${documentId}`);
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Submit all draft documents for reviewer verification
   * POST /api/v1/sellers/documents/submit
   */
  async submitDocuments(): Promise<string> {
    try {
      const { data } = await apiAxios.post<string>(
        API_ENDPOINTS.SELLERS.DOCUMENTS_SUBMIT
      );
      return data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
