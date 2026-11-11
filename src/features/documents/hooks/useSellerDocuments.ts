import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import { ApiClientError } from '../../../api/client';
import type {
  DocumentType,
  SellerDocumentResponseDTO,
  SellerDocumentViewResponseDTO,
} from '../../../types/document.types';

export const SELLER_DOCUMENTS_QUERY_KEY = ['seller', 'documents'];

export function useSellerDocuments() {
  const queryClient = useQueryClient();

  const {
    data: documents = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SellerDocumentResponseDTO[], ApiClientError>({
    queryKey: SELLER_DOCUMENTS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await documentService.getAllDocuments();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          return [];
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
    staleTime: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SELLER_DOCUMENTS_QUERY_KEY });
  };

  const uploadMutation = useMutation<
    SellerDocumentResponseDTO,
    ApiClientError,
    { file: File; documentType: DocumentType }
  >({
    mutationFn: ({ file, documentType }) =>
      documentService.uploadDocument(file, documentType),
    onSuccess: () => {
      invalidate();
    },
  });

  const deleteMutation = useMutation<void, ApiClientError, number | string>({
    mutationFn: (documentId) => documentService.deleteDocument(documentId),
    onSuccess: () => {
      invalidate();
    },
  });

  const submitMutation = useMutation<string, ApiClientError, void>({
    mutationFn: () => documentService.submitDocuments(),
    onSuccess: () => {
      invalidate();
    },
  });

  const fetchSignedUrl = async (documentId: number | string): Promise<SellerDocumentViewResponseDTO> => {
    return await documentService.getDocumentById(documentId);
  };

  const draftDocuments = documents.filter((doc) => doc.status === 'DRAFT');
  const submittedDocuments = documents.filter((doc) => doc.status === 'SUBMITTED');
  const approvedDocuments = documents.filter((doc) => doc.status === 'APPROVED');
  const rejectedDocuments = documents.filter((doc) => doc.status === 'REJECTED');

  const uploadedTypes = new Set<DocumentType>(documents.map((doc) => doc.documentType));

  return {
    documents,
    isLoading,
    isError,
    error,
    refetch,
    draftDocuments,
    submittedDocuments,
    approvedDocuments,
    rejectedDocuments,
    hasDrafts: draftDocuments.length > 0,
    uploadedTypes,
    uploadMutation,
    deleteMutation,
    submitMutation,
    fetchSignedUrl,
  };
}
