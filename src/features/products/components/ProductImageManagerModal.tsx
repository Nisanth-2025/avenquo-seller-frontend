import React, { useState, useRef } from 'react';
import { ProductResponseDTO, ProductImageDTO } from '../../../types/product.types';
import { useProductMutations } from '../hooks/useSellerProducts';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  X,
  Upload,
  Star,
  Trash2,
  RefreshCw,
  MoveLeft,
  MoveRight,
  Plus,
  ImageIcon,
} from 'lucide-react';

interface ProductImageManagerModalProps {
  product: ProductResponseDTO | null;
  onClose: () => void;
  onProductUpdated?: (updated: ProductResponseDTO) => void;
}

export const ProductImageManagerModal: React.FC<ProductImageManagerModalProps> = ({
  product,
  onClose,
  onProductUpdated,
}) => {
  const {
    addImagesMutation,
    replaceImageMutation,
    deleteImageMutation,
    setPrimaryImageMutation,
    reorderImagesMutation,
  } = useProductMutations();

  const [localImages, setLocalImages] = useState<ProductImageDTO[]>(
    product?.images ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hidden file inputs
  const addFilesInputRef = useRef<HTMLInputElement>(null);
  const [replacingImageId, setReplacingImageId] = useState<number | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Sync if product prop changes
  React.useEffect(() => {
    if (product?.images) {
      setLocalImages([...product.images].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [product?.images]);

  if (!product) return null;

  const currentCount = localImages.length;
  const maxAddAllowed = 5 - currentCount;

  // Set Primary Image
  const handleSetPrimary = async (imageId: number) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await setPrimaryImageMutation.mutateAsync({
        productId: product.productId,
        imageId,
      });
      setLocalImages([...updated.images].sort((a, b) => a.sortOrder - b.sortOrder));
      setSuccessMsg('Primary image updated.');
      onProductUpdated?.(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to set primary image.');
    }
  };

  // Replace Image
  const handleTriggerReplace = (imageId: number) => {
    setReplacingImageId(imageId);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
      replaceFileInputRef.current.click();
    }
  };

  const handleFileReplaced = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingImageId) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await replaceImageMutation.mutateAsync({
        productId: product.productId,
        imageId: replacingImageId,
        image: file,
      });
      setLocalImages([...updated.images].sort((a, b) => a.sortOrder - b.sortOrder));
      setSuccessMsg('Image replaced successfully.');
      onProductUpdated?.(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to replace image.');
    } finally {
      setReplacingImageId(null);
    }
  };

  // Delete Image
  const handleDelete = async (imageId: number) => {
    if (currentCount <= 1) {
      setErrorMsg('A product must retain at least 1 image.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await deleteImageMutation.mutateAsync({
        productId: product.productId,
        imageId,
      });
      setLocalImages([...updated.images].sort((a, b) => a.sortOrder - b.sortOrder));
      setSuccessMsg('Image deleted successfully.');
      onProductUpdated?.(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete image.');
    }
  };

  // Reorder images locally and commit to API
  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localImages.length) return;

    const reordered = [...localImages];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);

    setLocalImages(reordered);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const imageIds = reordered.map((img) => img.productImageId);
      const updated = await reorderProductImages(product.productId, imageIds);
      setLocalImages([...updated.images].sort((a, b) => a.sortOrder - b.sortOrder));
      setSuccessMsg('Image order saved.');
      onProductUpdated?.(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reorder images.');
      // Revert on error
      if (product.images) {
        setLocalImages([...product.images].sort((a, b) => a.sortOrder - b.sortOrder));
      }
    }
  };

  async function reorderProductImages(productId: number, imageIds: number[]) {
    return await reorderImagesMutation.mutateAsync({ productId, imageIds });
  }

  // Handle new files selection for addition
  const handleAddFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length > maxAddAllowed) {
      setErrorMsg(`You can only add up to ${maxAddAllowed} more image(s). (Max 5 total)`);
      return;
    }

    setNewFiles(files);
  };

  // Upload new images
  const handleUploadNewImages = async () => {
    if (!newFiles.length) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await addImagesMutation.mutateAsync({
        productId: product.productId,
        images: newFiles,
      });
      setLocalImages([...updated.images].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewFiles([]);
      if (addFilesInputRef.current) addFilesInputRef.current.value = '';
      setSuccessMsg(`${newFiles.length} new image(s) uploaded.`);
      onProductUpdated?.(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add images.');
    }
  };

  const isWorking =
    addImagesMutation.isPending ||
    replaceImageMutation.isPending ||
    deleteImageMutation.isPending ||
    setPrimaryImageMutation.isPending ||
    reorderImagesMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Manage Product Images</h2>
              <p className="text-xs text-gray-500">
                {product.productName} · <span className="font-mono">SKU: {product.sku}</span> ·{' '}
                <span className="font-semibold text-brand-600">
                  {currentCount} of 5 images used
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Messages */}
          {errorMsg && (
            <Alert variant="error" message={errorMsg} onClose={() => setErrorMsg(null)} />
          )}
          {successMsg && (
            <Alert variant="success" message={successMsg} onClose={() => setSuccessMsg(null)} />
          )}

          {/* Current Images List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Current Images ({currentCount})
              </h3>
              <span className="text-[11px] text-gray-400">
                Drag or use arrows to rearrange order
              </span>
            </div>

            {currentCount === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-xs">
                No images associated with this product.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {localImages.map((img, idx) => (
                  <div
                    key={img.productImageId}
                    className={`relative rounded-xl border p-2.5 transition-all bg-white shadow-xs ${
                      img.primaryImage
                        ? 'border-brand-500 ring-2 ring-brand-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-100 mb-2.5">
                      <img
                        src={img.imageUrl}
                        alt={img.altText || `Image ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {/* Primary badge */}
                      {img.primaryImage ? (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Star className="h-3 w-3 fill-white" /> PRIMARY
                        </div>
                      ) : (
                        <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Image Controls */}
                    <div className="space-y-1.5 text-xs">
                      {/* Set Primary Button */}
                      {!img.primaryImage && (
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleSetPrimary(img.productImageId)}
                          className="w-full flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 font-medium transition-colors"
                        >
                          <Star className="h-3 w-3" /> Set as Primary
                        </button>
                      )}

                      {/* Row of actions: Replace, Move Left, Move Right, Delete */}
                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100">
                        {/* Reorder Left */}
                        <button
                          type="button"
                          disabled={idx === 0 || isWorking}
                          onClick={() => handleMove(idx, 'left')}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move earlier"
                        >
                          <MoveLeft className="h-3.5 w-3.5" />
                        </button>

                        {/* Replace Button */}
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleTriggerReplace(img.productImageId)}
                          className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-[11px] font-medium"
                          title="Replace this image"
                        >
                          <RefreshCw className="h-3 w-3" /> Replace
                        </button>

                        {/* Reorder Right */}
                        <button
                          type="button"
                          disabled={idx === localImages.length - 1 || isWorking}
                          onClick={() => handleMove(idx, 'right')}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move later"
                        >
                          <MoveRight className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={currentCount <= 1 || isWorking}
                          onClick={() => handleDelete(img.productImageId)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            currentCount <= 1
                              ? 'Product must have at least 1 image'
                              : 'Delete image'
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add More Images Section */}
          {currentCount < 5 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Add More Images</h4>
                  <p className="text-[11px] text-gray-500">
                    You can add up to {maxAddAllowed} more image(s) to this product.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addFilesInputRef.current?.click()}
                  disabled={isWorking}
                >
                  <Plus className="h-4 w-4" /> Select Files
                </Button>
              </div>

              {/* Hidden file input for adding */}
              <input
                ref={addFilesInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddFilesSelect}
                className="hidden"
              />

              {/* Selected Files Staging */}
              {newFiles.length > 0 && (
                <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700">
                    {newFiles.length} file(s) ready to upload:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {newFiles.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-700"
                      >
                        <span className="max-w-[150px] truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setNewFiles([])}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUploadNewImages}
                      loading={addImagesMutation.isPending}
                    >
                      <Upload className="h-4 w-4" /> Upload Selected Images
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input for single image replace */}
          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileReplaced}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/60">
          <span className="text-xs text-gray-500">
            Changes to primary image and ordering are synchronized automatically.
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
