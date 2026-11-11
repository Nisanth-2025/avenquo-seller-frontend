import React, { useState } from 'react';
import {
  FileText,
  FileImage,
  File,
  Trash2,
  AlertCircle,
  ExternalLink,
  Calendar,
  HardDrive,
} from 'lucide-react';
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
      hour: '2-digit',
      minute: '2-digit',
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:border-gray-300 transition-all duration-150 flex flex-col justify-between">
      <div>
        {/* Top Header: Icon + Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                isPdf
                  ? 'bg-rose-50 border-rose-100 text-rose-600'
                  : isImage
                  ? 'bg-blue-50 border-blue-100 text-blue-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {isPdf ? (
                <FileText className="h-6 w-6" />
              ) : isImage ? (
                <FileImage className="h-6 w-6" />
              ) : (
                <File className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                  {meta?.label || doc.documentType}
                </h4>
                {meta && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {meta.badge}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1" title={doc.fileName}>
                {doc.fileName}
              </p>
            </div>
          </div>

          <DocumentStatusBadge status={doc.status} />
        </div>

        {/* Rejection callout if rejected */}
        {doc.status === 'REJECTED' && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs text-red-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-950">Verification Rejected</p>
                <p className="mt-0.5 text-red-800 leading-relaxed">
                  {doc.rejectionReason || 'Document could not be verified. Please replace with a clear, valid copy.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata info */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5 truncate">
            <HardDrive className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span>{formatBytes(doc.sizeBytes)}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span title={doc.uploadedAt}>{formatDate(doc.uploadedAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleView}
          disabled={isViewing}
          loading={isViewing}
          className="text-xs h-8 px-3"
        >
          {!isViewing && <ExternalLink className="h-3.5 w-3.5" />}
          View Document
        </Button>

        {isDeletable && (
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2.5 py-1 text-xs font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
                className="text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 px-2.5"
                title={doc.status === 'REJECTED' ? 'Delete rejected document' : 'Delete draft document'}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            )}
          </div>
        )}

        {!isDeletable && (
          <span className="text-[11px] text-gray-400 font-medium italic">
            {doc.status === 'APPROVED' ? 'Verified document' : 'Locked for review'}
          </span>
        )}
      </div>
    </div>
  );
};
