import React, { useState } from 'react';
import { ProductResponseDTO } from '../../../types/product.types';
import { ProductStatusBadge } from './ProductStatusBadge';
import { Button } from '../../../components/ui/Button';
import {
  X,
  Package,
  Layers,
  Edit,
  ImageIcon,
  RotateCcw,
  Boxes,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductResponseDTO | null;
  onClose: () => void;
  onEdit: (product: ProductResponseDTO) => void;
  onManageImages: (product: ProductResponseDTO) => void;
  onToggleStatus: (product: ProductResponseDTO) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onManageImages,
  onToggleStatus,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) return null;

  const images = product.images || [];
  const primaryImg = images.find((i) => i.primaryImage) || images[0];
  const activeImg = images[activeImageIndex] || primaryImg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-slide-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{product.productName}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>ID: #{product.productId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProductStatusBadge status={product.status} size="sm" />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Visual & Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                {activeImg ? (
                  <img
                    src={activeImg.imageUrl}
                    alt={activeImg.altText || product.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-gray-300" />
                )}
                {activeImg?.primaryImage && (
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    PRIMARY IMAGE
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.productImageId}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-brand-600 ring-2 ring-brand-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Key Attributes */}
            <div className="space-y-4">
              {/* Price Block */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50/30 p-4 space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pricing
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-brand-700 font-mono">
                    ₹{Number(product.specialPrice).toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-sm font-medium text-gray-400 line-through font-mono">
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Inventory & Status Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  <span className="text-gray-400 font-medium block">Available Stock</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Boxes className="h-4 w-4 text-gray-500" />
                    <span
                      className={`font-bold text-sm font-mono ${
                        product.quantity === 0
                          ? 'text-red-600'
                          : product.quantity <= 5
                          ? 'text-amber-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {product.quantity} units
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  <span className="text-gray-400 font-medium block">Category</span>
                  <div className="flex items-center gap-1.5 mt-1 truncate">
                    <Layers className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 truncate">
                      {product.categoryName || `Category #${product.categoryId}`}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  <span className="text-gray-400 font-medium block">Return Policy</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <RotateCcw className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      {product.isReturnable
                        ? `${product.returnWindowDays || 7} Days Window`
                        : 'Non-Returnable'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                  <span className="text-gray-400 font-medium block">Slug</span>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-gray-700 truncate">
                    {product.slug}
                  </div>
                </div>
              </div>

              {/* Quick Actions in Detail */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onClose();
                    onEdit(product);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Product
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    onClose();
                    onManageImages(product);
                  }}
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Images ({images.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {product.shortDescription && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Short Description
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {product.shortDescription}
                </p>
              </div>
            )}

            {product.description && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Full Product Description
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
            <span>Last Updated: {new Date(product.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(product)}
            className={product.status === 'ACTIVE' ? 'text-amber-600' : 'text-emerald-600'}
          >
            {product.status === 'ACTIVE' ? 'Deactivate Product' : 'Activate Product'}
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
