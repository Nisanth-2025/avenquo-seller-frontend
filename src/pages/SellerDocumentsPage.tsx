import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSellerDocuments } from '../features/documents/hooks/useSellerDocuments';
import { DocumentCard } from '../features/documents/components/DocumentCard';
import { DocumentStatutoryChecklist } from '../features/documents/components/DocumentStatutoryChecklist';
import { DocumentUploadModal } from '../features/documents/components/DocumentUploadModal';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  ArrowLeft,
  FileCheck,
  Plus,
  RefreshCw,
  FolderOpen,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
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
    try {
      await uploadMutation.mutateAsync({ file, documentType });
      setSuccessNotice('Document uploaded successfully as draft.');
      closeUploadModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload document.';
      setApiError(msg);
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    setApiError(null);
    setSuccessNotice(null);
    try {
      await deleteMutation.mutateAsync(id);
      setSuccessNotice('Document removed successfully.');
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
      setSuccessNotice(msg || 'All draft documents submitted for verification.');
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mb-4 animate-pulse">
          <FileCheck className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading statutory documents…</p>
      </div>
    );
  }

  if (isError && error && error.status !== 404) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-card space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mx-auto">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Unable to load documents</h2>
          <p className="text-xs text-gray-500">{error.message || 'Server error occurred.'}</p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top sticky nav */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-900">Document Compliance</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/dashboard/tax" className="text-xs text-gray-500 hover:text-gray-900 hidden sm:inline">
              Tax Details
            </Link>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <Link to="/dashboard/bank" className="text-xs text-gray-500 hover:text-gray-900 hidden sm:inline">
              Bank Details
            </Link>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <Link to="/dashboard/address" className="text-xs text-gray-500 hover:text-gray-900 hidden sm:inline">
              Address
            </Link>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <Link to="/dashboard/profile" className="text-xs text-gray-500 hover:text-gray-900 hidden sm:inline">
              Store Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
            <p className="text-xs text-gray-500 mt-1">
              Submit mandatory business KYC, tax certificates, and identity proofs for merchant verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {hasDrafts && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmitAllDrafts}
                loading={submitMutation.isPending}
                className="bg-brand-600 hover:bg-brand-700 text-xs shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                Submit All Drafts ({draftDocuments.length})
              </Button>
            )}

            <Button
              type="button"
              variant={hasDrafts ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => openUploadModal()}
              className="text-xs"
            >
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Notices */}
        {successNotice && (
          <Alert variant="success" message={successNotice} onClose={() => setSuccessNotice(null)} />
        )}
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
        )}

        {/* Rejection Banner if any rejected docs exist */}
        {rejectedDocuments.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-950">Action Required: Document(s) Rejected</h4>
              <p className="mt-0.5 text-red-800 leading-relaxed">
                One or more documents require your attention. Review the reviewer feedback on each card below and upload updated copies.
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total Uploaded</span>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{documents.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-700">Drafts Pending</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-700">{draftDocuments.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-700">Under Review</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-700">{submittedDocuments.length}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700">Approved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{approvedDocuments.length}</p>
          </div>
        </div>

        {/* Statutory KYC Checklist Card */}
        <DocumentStatutoryChecklist
          documents={documents}
          hasDrafts={hasDrafts}
          isSubmitting={submitMutation.isPending}
          onOpenUpload={openUploadModal}
          onSubmitAll={handleSubmitAllDrafts}
        />

        {/* Uploaded Documents List Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Uploaded Files ({documents.length})
              </h2>
              <p className="text-xs text-gray-500">
                Click on any document to view its signed temporary preview or remove drafts.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium text-gray-600 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterStatus === 'ALL'
                    ? 'bg-white text-gray-900 shadow-xs font-semibold'
                    : 'hover:text-gray-900'
                }`}
              >
                All ({documents.length})
              </button>
              {draftDocuments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus('DRAFT')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === 'DRAFT'
                      ? 'bg-white text-amber-700 shadow-xs font-semibold'
                      : 'hover:text-amber-700'
                  }`}
                >
                  Drafts ({draftDocuments.length})
                </button>
              )}
              {submittedDocuments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus('SUBMITTED')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === 'SUBMITTED'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'hover:text-blue-700'
                  }`}
                >
                  Under Review ({submittedDocuments.length})
                </button>
              )}
              {approvedDocuments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus('APPROVED')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === 'APPROVED'
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'hover:text-emerald-700'
                  }`}
                >
                  Approved ({approvedDocuments.length})
                </button>
              )}
              {rejectedDocuments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus('REJECTED')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterStatus === 'REJECTED'
                      ? 'bg-white text-red-700 shadow-xs font-semibold'
                      : 'hover:text-red-700'
                  }`}
                >
                  Rejected ({rejectedDocuments.length})
                </button>
              )}
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-card space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 mx-auto">
                <FolderOpen className="h-7 w-7" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  {filterStatus === 'ALL'
                    ? 'No documents uploaded yet'
                    : `No ${filterStatus.toLowerCase()} documents`}
                </h3>
                <p className="text-xs text-gray-500">
                  {filterStatus === 'ALL'
                    ? 'Upload statutory KYC documents to initiate compliance verification for your store.'
                    : 'Switch filters or upload a new document to view records here.'}
                </p>
              </div>
              {filterStatus === 'ALL' && (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => openUploadModal()}
                  className="text-xs"
                >
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      </main>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        onUpload={handleUpload}
        uploadedTypes={uploadedTypes}
        defaultType={defaultUploadType}
        isUploading={uploadMutation.isPending}
      />
    </div>
  );
};

export default SellerDocumentsPage;
