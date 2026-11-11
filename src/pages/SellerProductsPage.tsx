import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SellerHeader } from '../components/navigation/SellerHeader';
import {
  useSellerProducts,
  useProductMutations,
} from '../features/products/hooks/useSellerProducts';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductImageManagerModal } from '../features/products/components/ProductImageManagerModal';
import { ProductDetailModal } from '../features/products/components/ProductDetailModal';
import { ProductStatusBadge } from '../features/products/components/ProductStatusBadge';
import {
  ProductResponseDTO,
  ProductListParams,
  ProductStatus,
} from '../types/product.types';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  Package,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Grid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  ImageIcon,
  Boxes,
  Power,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const SellerProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query Params state
  const [params, setParams] = useState<ProductListParams>({
    pageNumber: 0,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Client search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductResponseDTO | null>(null);
  const [productForImages, setProductForImages] = useState<ProductResponseDTO | null>(null);
  const [productForDetail, setProductForDetail] = useState<ProductResponseDTO | null>(null);

  // Status message
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // React Query hooks
  const { data, isLoading, isError, error, refetch, isFetching } = useSellerProducts(params);
  const { updateStatusMutation } = useProductMutations();

  // Check URL query params on mount (e.g. ?new=1&categoryId=12)
  const queryNew = searchParams.get('new');
  const queryCategoryId = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : null;

  useEffect(() => {
    if (queryNew === '1') {
      setIsCreateOpen(true);
      // Clean query params so modal doesn't keep opening on refresh
      searchParams.delete('new');
      searchParams.delete('categoryId');
      setSearchParams(searchParams, { replace: true });
    }
  }, [queryNew, searchParams, setSearchParams]);

  // Client-side filtering over returned page
  const filteredProducts = useMemo(() => {
    if (!data?.content) return [];
    let list = data.content;

    if (statusFilter !== 'ALL') {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          p.categoryName?.toLowerCase().includes(term)
      );
    }

    return list;
  }, [data?.content, statusFilter, searchTerm]);

  // Overall metric calculations based on loaded products
  const metrics = useMemo(() => {
    const list = data?.content || [];
    const total = data?.totalElements ?? list.length;
    const active = list.filter((p) => p.status === 'ACTIVE').length;
    const inactive = list.filter((p) => p.status === 'INACTIVE').length;
    const lowStock = list.filter((p) => p.quantity <= 5).length;
    const totalUnits = list.reduce((acc, p) => acc + (p.quantity || 0), 0);
    return { total, active, inactive, lowStock, totalUnits };
  }, [data]);

  // Toggle status handler
  const handleToggleStatus = async (product: ProductResponseDTO) => {
    const newStatus: ProductStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateStatusMutation.mutateAsync({
        productId: product.productId,
        status: newStatus,
      });
      setNotice({
        type: 'success',
        message: `Product "${product.productName}" is now ${newStatus}.`,
      });
      // Update modal if open
      if (productForDetail?.productId === product.productId) {
        setProductForDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update product status.',
      });
    }
  };

  const currentPage = data?.pageNumber ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SellerHeader activeTab="products" />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Product Catalog & Inventory
              </h1>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                Seller Managed
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Publish products, manage stock levels, update pricing, and maintain product imagery.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              loading={isFetching}
              title="Refresh product list"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* Global Notice Alert */}
        {notice && (
          <Alert
            variant={notice.type}
            message={notice.message}
            onClose={() => setNotice(null)}
          />
        )}

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 block">Total Listings</span>
              <span className="text-xl font-bold text-gray-900 font-mono">
                {metrics.total}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 block">Active Online</span>
              <span className="text-xl font-bold text-emerald-600 font-mono">
                {metrics.active}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 block">Units in Stock</span>
              <span className="text-xl font-bold text-gray-900 font-mono">
                {metrics.totalUnits}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 block">Low / No Stock</span>
              <span className="text-xl font-bold text-amber-600 font-mono">
                {metrics.lowStock}
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, SKU, slug, or category…"
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Filter, Sort & View Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
                  }
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                <span>Sort:</span>
                <select
                  value={`${params.sortBy}-${params.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [
                      'productId' | 'productName' | 'price' | 'createdAt' | 'status',
                      'asc' | 'desc'
                    ];
                    setParams((prev) => ({ ...prev, sortBy, sortOrder, pageNumber: 0 }));
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-brand-500 focus:outline-none"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="productName-asc">Title (A-Z)</option>
                  <option value="productName-desc">Title (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="status-asc">Status</option>
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
                  title="Grid View"
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
                  title="Table View"
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
                className="h-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse space-y-3"
              >
                <div className="h-44 rounded-xl bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
                <div className="h-6 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-red-900">Failed to load seller products</p>
            <p className="text-xs text-red-600">
              {error?.message || 'Server error while fetching your product catalog.'}
            </p>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No products found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No products match your active search or status filter.'
                  : 'You have not added any products to your catalog yet. Start selling by adding your first product.'}
              </p>
            </div>
            {searchTerm || statusFilter !== 'ALL' ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="h-4 w-4" /> Create First Product
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const primaryImage =
                product.images?.find((img) => img.primaryImage) || product.images?.[0];

              return (
                <div
                  key={product.productId}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center group-hover:opacity-95 transition-opacity">
                      {primaryImage ? (
                        <img
                          src={primaryImage.imageUrl}
                          alt={primaryImage.altText || product.productName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-gray-300" />
                      )}

                      {/* Image count */}
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono text-white flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> {product.images?.length || 0}
                      </span>

                      {/* Status */}
                      <div className="absolute top-2 right-2">
                        <ProductStatusBadge status={product.status} size="sm" />
                      </div>

                      {/* Category */}
                      {product.categoryName && (
                        <span className="absolute top-2 left-2 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-gray-700 shadow-xs">
                          {product.categoryName}
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3
                        onClick={() => setProductForDetail(product)}
                        className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1 cursor-pointer"
                        title={product.productName}
                      >
                        {product.productName}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 font-mono mt-0.5">
                        <span className="truncate max-w-[120px]">SKU: {product.sku}</span>
                        <span
                          className={`font-semibold ${
                            product.quantity === 0
                              ? 'text-red-600'
                              : product.quantity <= 5
                              ? 'text-amber-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {product.quantity} in stock
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base font-bold text-brand-700 font-mono">
                        ₹{Number(product.specialPrice).toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="text-xs text-gray-400 line-through font-mono">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setProductForDetail(product)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductToEdit(product)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductForImages(product)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="Manage Images"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>

                    {/* Quick Status Toggle */}
                    <button
                      type="button"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => handleToggleStatus(product)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-medium text-[11px] transition-colors ${
                        product.status === 'ACTIVE'
                          ? 'bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700 border border-gray-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                      title={product.status === 'ACTIVE' ? 'Set to Inactive' : 'Set to Active'}
                    >
                      <Power className="h-3 w-3" />
                      <span>{product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Return Policy</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const primaryImage =
                      product.images?.find((img) => img.primaryImage) || product.images?.[0];

                    return (
                      <tr
                        key={product.productId}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {/* Title & SKU & Image */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                              {primaryImage ? (
                                <img
                                  src={primaryImage.imageUrl}
                                  alt={product.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="absolute bottom-0 right-0 bg-black/60 px-1 text-[8px] text-white font-mono">
                                {product.images?.length || 0}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <span
                                onClick={() => setProductForDetail(product)}
                                className="font-semibold text-gray-900 block text-sm hover:text-brand-600 cursor-pointer truncate max-w-xs"
                              >
                                {product.productName}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono">
                                SKU: {product.sku}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-gray-700">
                          {product.categoryName ? (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                              {product.categoryName}
                            </span>
                          ) : (
                            <span className="text-gray-400">#{product.categoryId}</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-brand-700 text-sm">
                            ₹{Number(product.specialPrice).toFixed(2)}
                          </div>
                          {product.discount > 0 && (
                            <div className="text-[11px] text-gray-400 line-through font-mono">
                              ₹{Number(product.price).toFixed(2)} ({product.discount}% off)
                            </div>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 font-mono">
                          <span
                            className={`font-semibold ${
                              product.quantity === 0
                                ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full'
                                : product.quantity <= 5
                                ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full'
                                : 'text-gray-900'
                            }`}
                          >
                            {product.quantity} units
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <ProductStatusBadge status={product.status} size="sm" />
                        </td>

                        {/* Return policy */}
                        <td className="px-4 py-3 text-gray-500 text-[11px]">
                          {product.isReturnable
                            ? `${product.returnWindowDays || 7} days return`
                            : 'No returns'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setProductForDetail(product)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setProductToEdit(product)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setProductForImages(product)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="Images"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(product)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                product.status === 'ACTIVE'
                                  ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={
                                product.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
                              }
                            >
                              <Power className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
              <span className="font-semibold text-gray-900">{data.totalElements}</span> products)
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

      {/* Modals */}
      {/* Create / Edit Form Modal */}
      <ProductFormModal
        isOpen={isCreateOpen || Boolean(productToEdit)}
        onClose={() => {
          setIsCreateOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        initialCategoryId={queryCategoryId}
        onSuccess={(saved) => {
          setNotice({
            type: 'success',
            message: `Product "${saved.productName}" saved successfully.`,
          });
        }}
      />

      {/* Images Manager Modal */}
      <ProductImageManagerModal
        product={productForImages}
        onClose={() => setProductForImages(null)}
        onProductUpdated={(updated) => {
          setProductForImages(updated);
        }}
      />

      {/* Detail Modal */}
      <ProductDetailModal
        product={productForDetail}
        onClose={() => setProductForDetail(null)}
        onEdit={(p) => setProductToEdit(p)}
        onManageImages={(p) => setProductForImages(p)}
        onToggleStatus={(p) => handleToggleStatus(p)}
      />
    </div>
  );
};

export default SellerProductsPage;
