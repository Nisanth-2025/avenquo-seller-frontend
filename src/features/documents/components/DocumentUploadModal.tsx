import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileImage,
  AlertCircle,
  HardDrive,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import {
  DOCUMENT_TYPE_METAS,
  DocumentType,
} from '../../../types/document.types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, documentType: DocumentType) => Promise<void>;
  uploadedTypes: Set<DocumentType>;
  defaultType?: DocumentType;
  isUploading?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  uploadedTypes,
  defaultType,
  isUploading = false,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentType>('PAN');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Set default type when modal opens or defaultType changes
  useEffect(() => {
    if (defaultType && !uploadedTypes.has(defaultType)) {
      setSelectedType(defaultType);
    } else {
      // Pick first unuploaded type if available
      const allTypes: DocumentType[] = [
        'PAN',
        'GST_CERTIFICATE',
        'ADDRESS_PROOF',
        'BUSINESS_REGISTRATION',
        'CIN_CERTIFICATE',
        'OTHER',
      ];
      const available = allTypes.find((t) => !uploadedTypes.has(t));
      if (available) {
        setSelectedType(available);
      }
    }
    setSelectedFile(null);
    setFileError(null);
  }, [isOpen, defaultType, uploadedTypes]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setFileError(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File size exceeds the maximum allowed limit of 5 MB.');
      return;
    }

    // Validate type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isAllowedExt && !isAllowedMime) {
      setFileError('Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select a document file to upload.');
      return;
    }

    if (uploadedTypes.has(selectedType)) {
      setFileError(
        `A document for ${DOCUMENT_TYPE_METAS[selectedType].label} has already been uploaded.`
      );
      return;
    }

    await onUpload(selectedFile, selectedType);
  };

  const isTypeAlreadyUploaded = uploadedTypes.has(selectedType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Upload Compliance Document</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload statutory verification document as draft.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Document Classification <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as DocumentType);
                setFileError(null);
              }}
              disabled={isUploading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            >
              {(Object.keys(DOCUMENT_TYPE_METAS) as DocumentType[]).map((type) => {
                const meta = DOCUMENT_TYPE_METAS[type];
                const isUploaded = uploadedTypes.has(type);
                return (
                  <option key={type} value={type} disabled={isUploaded}>
                    {meta.label} ({meta.badge}) {isUploaded ? '— Already Uploaded' : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">
              {DOCUMENT_TYPE_METAS[selectedType]?.shortDescription}
            </p>
          </div>

          {/* Already uploaded warning if selected */}
          {isTypeAlreadyUploaded && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <Info className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                A document of this type already exists. Delete the existing document or select another category.
              </span>
            </div>
          )}

          {/* Dropzone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Select Document File <span className="text-red-500">*</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/50'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-gray-300 hover:border-brand-400 bg-gray-50/50 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="h-6 w-6" />
                    ) : (
                      <FileImage className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                      <HardDrive className="h-3 w-3" />
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'file'}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-brand-600 hover:underline mt-1">
                    Click to replace file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-700">
                      <span className="text-brand-600 font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPEG, or PNG (Max 5.0 MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validation Error */}
          {fileError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!selectedFile || isTypeAlreadyUploaded || isUploading}
              loading={isUploading}
            >
              Upload & Save Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
