import React from 'react';
import { CategoryDTO } from '../../../types/category.types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { X, Layers, Calendar, PlusCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryDetailModalProps {
  category: CategoryDTO | null;
  onClose: () => void;
}

export const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  onClose,
}) => {
  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{category.categoryName}</h2>
              <p className="text-xs text-gray-400 font-mono">Category ID #{category.categoryId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Category Image Preview */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#f6f7f9] border border-gray-100 flex items-center justify-center">
            {category.categoryImageUrl ? (
              <img
                src={category.categoryImageUrl}
                alt={category.categoryName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300 gap-1.5">
                <Layers className="h-8 w-8 text-gray-300" />
                <span className="text-xs text-gray-400">No image provided</span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge variant={category.active ? 'green' : 'red'} size="sm" dot>
                {category.active ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-[#f6f7f9] p-3.5 space-y-1">
              <span className="text-gray-500 font-medium">Category Name</span>
              <p className="font-semibold text-gray-900 text-sm">{category.categoryName}</p>
            </div>

            <div className="rounded-2xl bg-[#f6f7f9] p-3.5 space-y-1">
              <span className="text-gray-500 font-medium">System ID</span>
              <p className="font-mono font-semibold text-brand-700 text-sm">
                #{category.categoryId}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f6f7f9] p-3.5 space-y-1">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Created On
              </span>
              <p className="text-gray-800 font-medium">
                {new Date(category.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f6f7f9] p-3.5 space-y-1">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Last Updated
              </span>
              <p className="text-gray-800 font-medium">
                {new Date(category.updatedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          {/* Integration Note */}
          <div className="rounded-2xl bg-blue-50/80 p-3.5 flex items-start gap-2.5 text-xs text-blue-900 border border-blue-100/60">
            <CheckCircle className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-950">Ready for Product Association:</span> You can create
              seller products assigned to this category. The backend validates that categories
              remain active during product creation.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Link to={`/dashboard/products?new=1&categoryId=${category.categoryId}`}>
            <Button size="sm" variant="primary">
              <PlusCircle className="h-3.5 w-3.5" /> Add Product in Category
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
