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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{category.categoryName}</h2>
              <p className="text-xs text-gray-500 font-mono">Category ID #{category.categoryId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Image Preview */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
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
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                <Layers className="h-10 w-10 text-gray-300" />
                <span className="text-xs">No image provided</span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge variant={category.active ? 'green' : 'red'} size="sm" dot>
                {category.active ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-1">
              <span className="text-gray-400 font-medium">Category Name</span>
              <p className="font-semibold text-gray-900 text-sm">{category.categoryName}</p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-1">
              <span className="text-gray-400 font-medium">System ID</span>
              <p className="font-mono font-semibold text-brand-700 text-sm">
                #{category.categoryId}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-1">
              <span className="text-gray-400 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Created On
              </span>
              <p className="text-gray-700 font-medium">
                {new Date(category.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-1">
              <span className="text-gray-400 font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Last Updated
              </span>
              <p className="text-gray-700 font-medium">
                {new Date(category.updatedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          {/* Integration Note */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 flex items-start gap-2.5 text-xs text-blue-800">
            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Ready for Product Association:</span> You can create
              seller products assigned to this category. The backend validates that categories
              remain active during product creation.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Link to={`/dashboard/products?new=1&categoryId=${category.categoryId}`}>
            <Button size="sm">
              <PlusCircle className="h-4 w-4" /> Add Product in Category
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
