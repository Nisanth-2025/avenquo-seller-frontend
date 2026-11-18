import React, { useState } from 'react';
import { useSellerDocuments } from '../features/documents/hooks/useSellerDocuments';
import { DocumentCard } from '../features/documents/components/DocumentCard';
import { DocumentStatutoryChecklist } from '../features/documents/components/DocumentStatutoryChecklist';
import { DocumentUploadModal } from '../features/documents/components/DocumentUploadModal';
import { AccountWorkspace } from '../features/account/components/AccountWorkspace';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react';
import { SellerHeader } from '../components/navigation/SellerHeader';
import type { DocumentType } from '../types/document.types';

export const SellerDocumentsPage: React.FC = () => {
  const {
    documents,
    isLoading,
    isError,
    error,
    refetch,
    draftDocuments,
    submittedDocuments,
    approvedDocuments,
    rejectedDocuments,
    hasDrafts,
    uploadedTypes,
    uploadMutation,
    deleteMutation,
    submitMutation,
    fetchSignedUrl,
  } = useSellerDocuments();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [defaultUploadType, setDefaultUploadType] = useState<DocumentType | undefined>(undefined);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('ALL');

  const openUploadModal = (type?: DocumentType) => {
    setDefaultUploadType(type);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setDefaultUploadType(undefined);
  };

  const handleUpload = async (file: File, documentType: DocumentType) => {
    setApiError(null);
    setSuccessNotice(null);
    await uploadMutation.mutateAsync({ file, documentType });
    setSuccessNotice('Document uploaded.');
    closeUploadModal();
  };

  const handleDelete = async (id: number) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      await deleteMutation.mutateAsync(id);
      setSuccessNotice('Document removed.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete document.';
      setApiError(msg);
    }
  };

  const handleView = async (id: number) => {
    setApiError(null);
    try {
      const viewData = await fetchSignedUrl(id);
      if (viewData?.signedUrl) {
        window.open(viewData.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        setApiError('Unable to generate secure view link.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load document view link.';
      setApiError(msg);
    }
  };

  const handleSubmitAllDrafts = async () => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      const msg = await submitMutation.mutateAsync();
      setSuccessNotice(msg || 'Draft documents submitted for verification.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit documents.';
      setApiError(msg);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filterStatus === 'ALL') return true;
    return doc.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 animate-pulse">
            <FileCheck className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading documents…</p>
        </div>
      </div>
    );
  }

  if (isError && error && error.status !== 404) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f3f4f8]">
        <SellerHeader activeTab="account" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Could not load documents</h2>
            <p className="text-sm text-gray-500">{error.message || 'Unable to retrieve documents.'}</p>
            <Button onClick={() => refetch()} variant="primary" size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filters: Array<{
    key: typeof filterStatus;
    label: string;
    count: number;
  }> = [
    { key: 'ALL', label: 'All', count: documents.length },
    { key: 'DRAFT', label: 'Drafts', count: draftDocuments.length },
    { key: 'SUBMITTED', label: 'In review', count: submittedDocuments.length },
    { key: 'APPROVED', label: 'Approved', count: approvedDocuments.length },
    { key: 'REJECTED', label: 'Rejected', count: rejectedDocuments.length },
  ];

  return (
    <AccountWorkspace
      title="Documents"
      actions={
        <>
          {hasDrafts && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmitAllDrafts}
              loading={submitMutation.isPending}
            >
              <Send className="h-3.5 w-3.5" />
              Submit drafts ({draftDocuments.length})
            </Button>
          )}
          <Button
            type="button"
            variant={hasDrafts ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => openUploadModal()}
          >
            <Plus className="h-4 w-4" />
            Upload
          </Button>
        </>
      }
    >
      {successNotice && (
        <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
      )}
      {apiError && (
        <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
      )}

      {rejectedDocuments.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>
            {rejectedDocuments.length} document{rejectedDocuments.length === 1 ? '' : 's'} rejected.
            Review the reason on each file and upload a replacement.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Uploaded', value: documents.length, icon: FileText, tone: 'text-gray-700' },
          { label: 'Drafts', value: draftDocuments.length, icon: Clock, tone: 'text-amber-600' },
          { label: 'In review', value: submittedDocuments.length, icon: Clock, tone: 'text-brand-600' },
          { label: 'Approved', value: approvedDocuments.length, icon: CheckCircle2, tone: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-[#f6f7f9] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              <stat.icon className={`h-4 w-4 ${stat.tone}`} />
            </div>
            <p className="mt-4 text-xs font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <DocumentStatutoryChecklist
        documents={documents}
        hasDrafts={hasDrafts}
        isSubmitting={submitMutation.isPending}
        onOpenUpload={openUploadModal}
        onSubmitAll={handleSubmitAllDrafts}
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Files</h2>
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#f6f7f9] p-1 text-xs font-medium text-gray-600">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setFilterStatus(filter.key)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'hover:text-gray-900'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="rounded-2xl bg-[#f6f7f9] px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              {filterStatus === 'ALL' ? 'No documents yet' : 'Nothing in this filter'}
            </h3>
            {filterStatus === 'ALL' && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => openUploadModal()}
                className="mt-4"
              >
                <Plus className="h-4 w-4" />
                Upload
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={handleView}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        onUpload={handleUpload}
        uploadedTypes={uploadedTypes}
        defaultType={defaultUploadType}
        isUploading={uploadMutation.isPending}
      />
    </AccountWorkspace>
  );
};

export default SellerDocumentsPage;
