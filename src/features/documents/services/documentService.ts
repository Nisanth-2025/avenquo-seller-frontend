import { apiAxios, extractApiError } from '../../../api/client';
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
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const { data } = await apiAxios.post<SellerDocumentResponseDTO>(
        API_ENDPOINTS.SELLERS.DOCUMENTS,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data;
    } catch (err) {
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
