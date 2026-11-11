import React, { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ImageUploadDropzoneProps {
  label: string;
  type: 'logo' | 'banner';
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  aspectRatioLabel?: string;
  recommendedSize?: string;
  disabled?: boolean;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  label,
  type,
  currentUrl,
  onUpload,
  onDelete,
  aspectRatioLabel = type === 'logo' ? '1:1 Square' : '16:9 or 3:1 Widescreen',
  recommendedSize = type === 'logo' ? '500 x 500 px' : '1200 x 400 px',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = async (file: File) => {
    setErrorMsg(null);
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    // Validate file size: 5MB max
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must not exceed 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload image.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;
    setErrorMsg(null);
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to remove ${type}.`;
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">
          {aspectRatioLabel} · {recommendedSize}
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          const file = e.dataTransfer.files[0];
          if (file) handleFileChange(file);
        }}
        className={clsx(
          'relative rounded-xl border border-dashed transition-all duration-150 overflow-hidden',
          dragOver ? 'border-brand-500 bg-brand-50/50' : 'border-gray-300 bg-gray-50/60 hover:bg-gray-50',
          type === 'logo' ? 'h-36 sm:h-40' : 'h-44 sm:h-52',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-100'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled || isUploading || isDeleting}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />

        {currentUrl ? (
          <div className="relative w-full h-full group flex items-center justify-center bg-gray-900/5">
            <img
              src={currentUrl}
              alt={label}
              className={clsx(
                'w-full h-full object-cover transition-opacity duration-150',
                type === 'logo' ? 'object-contain max-h-full p-2' : 'object-cover'
              )}
            />

            {/* Overlay buttons on hover */}
            {!disabled && (
              <div className="absolute inset-0 bg-gray-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs shadow-md"
                >
                  <Upload className="h-3.5 w-3.5" /> Replace
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={isDeleting}
                  onClick={handleDelete}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-md"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-xs mb-2 text-gray-500">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold text-gray-800">
              {dragOver ? 'Drop file to upload' : `Upload ${type === 'logo' ? 'Store Logo' : 'Cover Banner'}`}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">PNG, JPG, or WebP up to 5MB</p>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={isUploading}
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs"
            >
              <Upload className="h-3 w-3" /> Select File
            </Button>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
