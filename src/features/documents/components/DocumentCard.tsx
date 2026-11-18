import React, { useState } from 'react';
import { AlertCircle, ExternalLink, File, FileImage, FileText, Trash2 } from 'lucide-react';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { Button } from '../../../components/ui/Button';
import { DOCUMENT_TYPE_METAS } from '../../../types/document.types';
import type { SellerDocumentResponseDTO } from '../../../types/document.types';

interface DocumentCardProps {
  document: SellerDocumentResponseDTO;
  onView: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isDeleting?: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  onView,
  onDelete,
  isDeleting = false,
}) => {
  const [isViewing, setIsViewing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = DOCUMENT_TYPE_METAS[doc.documentType];
  const isPdf = doc.contentType === 'application/pdf';
  const isImage = doc.contentType.startsWith('image/');
  const isDeletable = doc.status === 'DRAFT' || doc.status === 'REJECTED';

  const handleView = async () => {
    setIsViewing(true);
    try {
      await onView(doc.id);
    } finally {
      setIsViewing(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(doc.id);
    setConfirmDelete(false);
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-[#f6f7f9] p-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              {isPdf ? (
                <FileText className="h-5 w-5" />
              ) : isImage ? (
                <FileImage className="h-5 w-5" />
              ) : (
                <File className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold text-gray-900">
                {meta?.label || doc.documentType}
              </h4>
              <p className="mt-0.5 truncate text-xs text-gray-500" title={doc.fileName}>
                {doc.fileName}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                {formatBytes(doc.sizeBytes)} · {formatDate(doc.uploadedAt)}
              </p>
            </div>
          </div>
          <DocumentStatusBadge status={doc.status} />
        </div>

        {doc.status === 'REJECTED' && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-red-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
            <p>{doc.rejectionReason || 'This document was rejected. Upload a replacement.'}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleView}
          disabled={isViewing}
          loading={isViewing}
          className="h-8 px-3 text-xs"
        >
          {!isViewing && <ExternalLink className="h-3.5 w-3.5" />}
          View
        </Button>

        {isDeletable && (
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="h-8 px-2.5 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600"
                title={doc.status === 'REJECTED' ? 'Delete rejected document' : 'Delete draft document'}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
