import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ProductResponseDTO,
  ProductCreateRequestDTO,
  ProductUpdateRequestDTO,
} from '../../../types/product.types';
import { useCategories } from '../../categories/hooks/useCategories';
import { useProductMutations } from '../hooks/useSellerProducts';
import { ApiClientError } from '../../../api/client';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import {
  X,
  Upload,
  Trash2,
  Package,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  RotateCcw,
} from 'lucide-react';

// Validation Schema
const productFormSchema = z
  .object({
    categoryId: z.coerce.number().min(1, 'Please select a valid category'),
    productName: z
      .string()
      .min(1, 'Product name is required')
      .max(150, 'Product name cannot exceed 150 characters'),
    sku: z
      .string()
      .min(1, 'SKU is required')
      .max(100, 'SKU cannot exceed 100 characters')
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'SKU can only contain letters, numbers, dots, hyphens, and underscores'
      ),
    shortDescription: z
      .string()
      .max(500, 'Short description cannot exceed 500 characters')
      .optional()
      .or(z.literal('')),
    description: z
      .string()
      .max(2000, 'Description cannot exceed 2000 characters')
      .optional()
      .or(z.literal('')),
    price: z.coerce.number().positive('Price must be greater than 0'),
    discount: z.coerce
      .number()
      .min(0, 'Discount cannot be negative')
      .max(100, 'Discount cannot exceed 100%')
      .default(0),
    quantity: z.coerce
      .number()
      .int('Quantity must be an integer')
      .min(0, 'Quantity cannot be negative'),
    isReturnable: z.boolean().default(false),
    returnWindowDays: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.isReturnable) {
        return (
          data.returnWindowDays !== undefined &&
          data.returnWindowDays !== null &&
          data.returnWindowDays >= 1
        );
      }
      return true;
    },
    {
      message: 'Return window must be at least 1 day when item is returnable',
      path: ['returnWindowDays'],
    }
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductResponseDTO | null;
  initialCategoryId?: number | null;
  onSuccess?: (product: ProductResponseDTO) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  initialCategoryId,
  onSuccess,
}) => {
  const isEditMode = Boolean(productToEdit);
  const { createMutation, updateMutation } = useProductMutations();
  const { data: categoryData, isLoading: categoriesLoading } = useCategories({
    pageSize: 100,
    sortBy: 'categoryName',
    sortOrder: 'asc',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      categoryId: initialCategoryId || 0,
      productName: '',
      sku: '',
      shortDescription: '',
      description: '',
      price: 0,
      discount: 0,
      quantity: 0,
      isReturnable: false,
      returnWindowDays: 7,
    },
  });

  const watchedPrice = watch('price') || 0;
  const watchedDiscount = watch('discount') || 0;
  const watchedIsReturnable = watch('isReturnable');

  // Calculate live special price
  const computedSpecialPrice = Math.max(
    0,
    watchedPrice - (watchedPrice * (watchedDiscount || 0)) / 100
  );

  // Sync form when opening or editing
  useEffect(() => {
    if (productToEdit) {
      reset({
        categoryId: productToEdit.categoryId,
        productName: productToEdit.productName,
        sku: productToEdit.sku,
        shortDescription: productToEdit.shortDescription || '',
        description: productToEdit.description || '',
        price: productToEdit.price,
        discount: productToEdit.discount,
        quantity: productToEdit.quantity,
        isReturnable: productToEdit.isReturnable,
        returnWindowDays: productToEdit.returnWindowDays || 7,
      });
      setSelectedFiles([]);
      setFilePreviews([]);
    } else {
      reset({
        categoryId: initialCategoryId || 0,
        productName: '',
        sku: '',
        shortDescription: '',
        description: '',
        price: 0,
        discount: 0,
        quantity: 1,
        isReturnable: false,
        returnWindowDays: 7,
      });
      setSelectedFiles([]);
      setFilePreviews([]);
    }
    setApiError(null);
  }, [productToEdit, initialCategoryId, reset, isOpen]);

  if (!isOpen) return null;

  // Handle image files selection in create mode
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalAllowed = 5;
    const combined = [...selectedFiles, ...files].slice(0, totalAllowed);

    setSelectedFiles(combined);

    // Generate previews
    const previews = combined.map((f) => URL.createObjectURL(f));
    setFilePreviews(previews);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = updatedFiles.map((f) => URL.createObjectURL(f));
    setFilePreviews(updatedPreviews);
  };

  const onSubmit = async (values: ProductFormValues) => {
    setApiError(null);

    // Validation for create mode: 1-5 images required
    if (!isEditMode && selectedFiles.length === 0) {
      setApiError('At least 1 product image is required to create a product (maximum 5).');
      return;
    }

    try {
      if (isEditMode && productToEdit) {
        // Edit mode
        const updatePayload: ProductUpdateRequestDTO = {
          categoryId: values.categoryId,
          productName: values.productName,
          sku: values.sku,
          shortDescription: values.shortDescription || undefined,
          description: values.description || undefined,
          price: values.price,
          discount: values.discount,
          quantity: values.quantity,
          isReturnable: values.isReturnable,
          returnWindowDays: values.isReturnable ? values.returnWindowDays : undefined,
        };

        const result = await updateMutation.mutateAsync({
          productId: productToEdit.productId,
          data: updatePayload,
        });

        onSuccess?.(result);
        onClose();
      } else {
        // Create mode
        const createPayload: ProductCreateRequestDTO = {
          categoryId: values.categoryId,
          productName: values.productName,
          sku: values.sku,
          shortDescription: values.shortDescription || undefined,
          description: values.description || undefined,
          price: values.price,
          discount: values.discount,
          quantity: values.quantity,
          isReturnable: values.isReturnable,
          returnWindowDays: values.isReturnable ? values.returnWindowDays : undefined,
        };

        const result = await createMutation.mutateAsync({
          product: createPayload,
          images: selectedFiles,
        });

        onSuccess?.(result);
        onClose();
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            setError(field as keyof ProductFormValues, { message: msg });
          });
        }
        setApiError(err.message);
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while saving the product.');
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const categoryOptions = [
    { value: '0', label: '— Select Active Category —' },
    ...(categoryData?.content?.map((c) => ({
      value: c.categoryId.toString(),
      label: `${c.categoryName} (#${c.categoryId})`,
    })) || []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-slide-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Create New Product'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditMode
                  ? `Update product details for SKU: ${productToEdit?.sku}`
                  : 'Add a new product with pricing, inventory, and product imagery.'}
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

        {/* Scrollable Form Body */}
        <form
          id="product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 overflow-y-auto space-y-6 flex-1"
        >
          {apiError && (
            <Alert variant="error" message={apiError} onClose={() => setApiError(null)} />
          )}

          {/* Category & Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Layers className="h-4 w-4" /> Classification & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <Select
                  label="Category *"
                  options={categoryOptions}
                  error={errors.categoryId?.message}
                  disabled={categoriesLoading}
                  hint={categoriesLoading ? 'Loading categories…' : 'Marketplace category'}
                  {...register('categoryId')}
                />
              </div>

              {/* SKU */}
              <div>
                <Input
                  label="SKU (Stock Keeping Unit) *"
                  placeholder="e.g. BOWL-CER-001"
                  error={errors.sku?.message}
                  hint="Letters, numbers, dots, hyphens, underscores (Unique)"
                  {...register('sku')}
                />
              </div>
            </div>

            {/* Product Name */}
            <div>
              <Input
                label="Product Title *"
                placeholder="e.g. Handcrafted Ceramic Serving Bowl (Large)"
                error={errors.productName?.message}
                hint="Max 150 characters"
                {...register('productName')}
              />
            </div>

            {/* Short Description */}
            <div>
              <Input
                label="Short Description"
                placeholder="Brief highlight of the product (e.g. Lead-free glaze with matte finish)"
                error={errors.shortDescription?.message}
                hint="Max 500 characters"
                {...register('shortDescription')}
              />
            </div>

            {/* Full Description */}
            <div>
              <Textarea
                label="Full Description"
                rows={3}
                placeholder="Comprehensive details, specifications, care instructions, and dimensions…"
                error={errors.description?.message}
                hint="Max 2000 characters"
                {...register('description')}
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" /> Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <Input
                  type="number"
                  step="0.01"
                  label="Price (₹) *"
                  placeholder="0.00"
                  error={errors.price?.message}
                  {...register('price')}
                />
              </div>

              {/* Discount % */}
              <div>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  label="Discount (%)"
                  placeholder="0"
                  error={errors.discount?.message}
                  hint="Percentage off"
                  {...register('discount')}
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  label="Inventory Units *"
                  placeholder="0"
                  error={errors.quantity?.message}
                  hint="Available stock"
                  {...register('quantity')}
                />
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <span className="text-gray-600 font-medium">Computed Special Price:</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-brand-700 font-mono">
                  ₹{computedSpecialPrice.toFixed(2)}
                </span>
                {watchedDiscount > 0 && (
                  <span className="text-gray-400 line-through text-[11px] ml-2 font-mono">
                    ₹{Number(watchedPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Return Policy */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" /> Return & Refund Policy
            </h3>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50/50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  {...register('isReturnable')}
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">
                    Product is Returnable
                  </span>
                  <span className="text-xs text-gray-500 block">
                    Allow buyers to request return within an eligibility window
                  </span>
                </div>
              </label>

              {watchedIsReturnable && (
                <div className="pt-3 border-t border-gray-200 max-w-xs">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    label="Return Window (Days) *"
                    placeholder="7"
                    error={errors.returnWindowDays?.message}
                    hint="Number of days from delivery (e.g. 7 or 14)"
                    {...register('returnWindowDays')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product Images (Create Mode Only) */}
          {!isEditMode && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Upload className="h-4 w-4" /> Product Images (1 to 5 Required) *
                </h3>
                <span className="text-xs font-semibold text-brand-600">
                  {selectedFiles.length} of 5 selected
                </span>
              </div>

              {/* Upload Dropzone */}
              {selectedFiles.length < 5 && (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-400 p-6 bg-gray-50/50 hover:bg-brand-50/20 cursor-pointer transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">
                    Click to select product photos
                  </span>
                  <span className="text-[11px] text-gray-400 mt-0.5">
                    Select 1-5 images (First image will automatically be set as Primary)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Selected Previews */}
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {filePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group shadow-xs"
                    >
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-red-600 text-white p-1 opacity-80 hover:opacity-100 shadow-sm"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isEditMode && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs text-blue-800 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Need to manage product imagery?</span> You can add,
                replace, delete, reorder, and set primary images from the "Manage Images" button on
                the product card or table.
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/60">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            size="sm"
            loading={isSubmitting}
            disabled={!isEditMode && selectedFiles.length === 0}
          >
            {isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </div>
  );
};
