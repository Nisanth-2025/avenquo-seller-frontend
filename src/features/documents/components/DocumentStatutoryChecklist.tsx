import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Send,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DOCUMENT_TYPE_METAS } from '../../../types/document.types';
import type { DocumentType, SellerDocumentResponseDTO } from '../../../types/document.types';

interface DocumentStatutoryChecklistProps {
  documents: SellerDocumentResponseDTO[];
  hasDrafts: boolean;
  isSubmitting?: boolean;
  onOpenUpload: (defaultType?: DocumentType) => void;
  onSubmitAll: () => Promise<void>;
}

export const DocumentStatutoryChecklist: React.FC<DocumentStatutoryChecklistProps> = ({
  documents,
  hasDrafts,
  isSubmitting = false,
  onOpenUpload,
  onSubmitAll,
}) => {
  const docMap = new Map<DocumentType, SellerDocumentResponseDTO>();
  documents.forEach((d) => docMap.set(d.documentType, d));

  const standardTypes: DocumentType[] = [
    'PAN',
    'GST_CERTIFICATE',
    'ADDRESS_PROOF',
    'BUSINESS_REGISTRATION',
    'CIN_CERTIFICATE',
  ];

  // Count required documents uploaded
  const requiredTypes: DocumentType[] = ['PAN', 'GST_CERTIFICATE', 'ADDRESS_PROOF'];
  const requiredUploadedCount = requiredTypes.filter((t) => docMap.has(t)).length;
  const progressPercent = Math.round((requiredUploadedCount / requiredTypes.length) * 100);

  const draftCount = documents.filter((d) => d.status === 'DRAFT').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FileCheck className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-gray-900">
              Statutory KYC & Compliance Documents
            </h3>
          </div>
          <p className="mt-1 text-xs text-gray-500 max-w-2xl leading-relaxed">
            Upload standard business verification records for merchant approval. Maximum file size is 5MB (PDF, JPEG, or PNG).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onOpenUpload()}
            className="text-xs"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>

          {hasDrafts && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={onSubmitAll}
              loading={isSubmitting}
              className="text-xs shadow-sm bg-brand-600 hover:bg-brand-700"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Drafts ({draftCount})
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar & Required Checklist */}
      <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-gray-700">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900">Mandatory KYC Verification:</span>
            <span>
              {requiredUploadedCount} of {requiredTypes.length} required documents uploaded
            </span>
          </span>
          <span className="text-brand-600 font-bold">{progressPercent}% Completed</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progressPercent === 100 ? 'bg-emerald-500' : 'bg-brand-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Statutory Matrix */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {standardTypes.map((type) => {
            const meta = DOCUMENT_TYPE_METAS[type];
            const doc = docMap.get(type);

            return (
              <div
                key={type}
                onClick={() => {
                  if (!doc) onOpenUpload(type);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  doc
                    ? doc.status === 'APPROVED'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : doc.status === 'REJECTED'
                      ? 'border-red-200 bg-red-50/40'
                      : doc.status === 'SUBMITTED'
                      ? 'border-blue-200 bg-blue-50/40'
                      : 'border-amber-200 bg-amber-50/40'
                    : 'border-dashed border-gray-300 bg-white hover:border-brand-400 hover:bg-brand-50/20 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-gray-900 truncate">
                    {meta.label}
                  </span>
                  {doc ? (
                    doc.status === 'APPROVED' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : doc.status === 'REJECTED' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    ) : doc.status === 'SUBMITTED' ? (
                      <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    )
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500">{meta.badge}</span>
                  <span
                    className={`font-medium ${
                      doc
                        ? doc.status === 'APPROVED'
                          ? 'text-emerald-700'
                          : doc.status === 'REJECTED'
                          ? 'text-red-700'
                          : doc.status === 'SUBMITTED'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {doc ? doc.status : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
