import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SellerHeader } from '../components/navigation/SellerHeader';
import { useCategories } from '../features/categories/hooks/useCategories';
import { CategoryDetailModal } from '../features/categories/components/CategoryDetailModal';
import { CategoryDTO, CategoryListParams } from '../types/category.types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Layers,
  Search,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Grid,
  List as ListIcon,
} from 'lucide-react';

export const SellerCategoriesPage: React.FC = () => {
  const [params, setParams] = useState<CategoryListParams>({
    pageNumber: 0,
    pageSize: 20,
    sortBy: 'categoryName',
    sortOrder: 'asc',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDTO | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useCategories(params);

  // Client-side quick filtering by search term across the fetched page
  const displayedCategories = useMemo(() => {
    if (!data?.content) return [];
    if (!searchTerm.trim()) return data.content;
    const term = searchTerm.toLowerCase();
    return data.content.filter(
      (c) =>
        c.categoryName.toLowerCase().includes(term) ||
        c.categoryId.toString().includes(term)
    );
  }, [data?.content, searchTerm]);

  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.pageNumber ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SellerHeader activeTab="categories" />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Marketplace Categories
              </h1>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                Public Catalog
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Browse approved marketplace categories to classify your seller products and optimize discoverability.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              loading={isFetching}
              title="Refresh category list"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Link to="/dashboard/products?new=1">
              <Button size="sm">
                <PlusCircle className="h-4 w-4" /> Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters & Controls Bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories by name or ID…"
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                <span>Sort by:</span>
                <select
                  value={`${params.sortBy}-${params.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [
                      'categoryId' | 'categoryName',
                      'asc' | 'desc'
                    ];
                    setParams((prev) => ({ ...prev, sortBy, sortOrder, pageNumber: 0 }));
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="categoryName-asc">Name (A to Z)</option>
                  <option value="categoryName-desc">Name (Z to A)</option>
                  <option value="categoryId-asc">ID (Lowest first)</option>
                  <option value="categoryId-desc">ID (Highest first)</option>
                </select>
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>Per page:</span>
                <select
                  value={params.pageSize}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      pageNumber: 0,
                    }))
                  }
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="12">12</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-brand-600 shadow-xs'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-brand-600 shadow-xs'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                  title="Table view"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse space-y-3"
              >
                <div className="h-36 rounded-xl bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-red-900">
              Failed to load categories
            </p>
            <p className="text-xs text-red-600">
              {error?.message || 'Server returned an error while fetching active categories.'}
            </p>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : displayedCategories.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No categories found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? `No active categories match "${searchTerm}". Try a different search term.`
                  : 'There are currently no active categories in the marketplace.'}
              </p>
            </div>
            {searchTerm && (
              <Button size="sm" variant="secondary" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedCategories.map((category) => (
              <div
                key={category.categoryId}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Category Image */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center group-hover:opacity-95 transition-opacity">
                    {category.categoryImageUrl ? (
                      <img
                        src={category.categoryImageUrl}
                        alt={category.categoryName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <Layers className="h-8 w-8 mb-1" />
                        <span className="text-[10px] text-gray-400">No image</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-medium text-white">
                      #{category.categoryId}
                    </span>
                    <span className="absolute top-2 right-2">
                      <Badge variant="green" size="sm" dot>
                        ACTIVE
                      </Badge>
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
                      {category.categoryName}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Updated {new Date(category.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand-600 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Details
                  </button>

                  <Link
                    to={`/dashboard/products?new=1&categoryId=${category.categoryId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Add Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">System ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Last Updated</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedCategories.map((category) => (
                    <tr
                      key={category.categoryId}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                            {category.categoryImageUrl ? (
                              <img
                                src={category.categoryImageUrl}
                                alt={category.categoryName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Layers className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block text-sm">
                              {category.categoryName}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                              ID: {category.categoryId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-brand-700">
                        #{category.categoryId}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="green" size="sm" dot>
                          ACTIVE
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {new Date(category.updatedAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/dashboard/products?new=1&categoryId=${category.categoryId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded-lg transition-colors"
                          >
                            <PlusCircle className="h-3.5 w-3.5" /> Product
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {data && data.totalElements > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Showing page <span className="font-semibold text-gray-900">{currentPage + 1}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages || 1}</span> (Total{' '}
              <span className="font-semibold text-gray-900">{data.totalElements}</span> active
              categories)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 0 || isFetching}
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    pageNumber: Math.max(0, (prev.pageNumber ?? 0) - 1),
                  }))
                }
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={data.lastPage || isFetching}
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    pageNumber: (prev.pageNumber ?? 0) + 1,
                  }))
                }
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Category Detail Modal */}
      <CategoryDetailModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  );
};

export default SellerCategoriesPage;
