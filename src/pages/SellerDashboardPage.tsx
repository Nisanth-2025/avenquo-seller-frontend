import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useSellerApplication } from '../features/seller/hooks/useSellerApplication';
import { useSellerProducts, useProductMutations } from '../features/products/hooks/useSellerProducts';
import { useCategories } from '../features/categories/hooks/useCategories';
import { SellerHeader } from '../components/navigation/SellerHeader';
import { ProductStatusBadge } from '../features/products/components/ProductStatusBadge';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductImageManagerModal } from '../features/products/components/ProductImageManagerModal';
import { ProductDetailModal } from '../features/products/components/ProductDetailModal';
import { ProductResponseDTO } from '../types/product.types';
import { Button } from '../components/ui/Button';
import {
  Package,
  Layers,
  ShoppingBag,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  PlusCircle,
  TrendingUp,
  Boxes,
  Eye,
  Edit,
  ImageIcon,
  Power,
  ChevronRight,
} from 'lucide-react';

export const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { application, isApproved, isChangesRequired, isSubmittedOrReview, isDraft, hasApplication } =
    useSellerApplication();

  // Load products (first 8 for dashboard preview)
  const { data: productData, isLoading: productsLoading } = useSellerProducts({
    pageNumber: 0,
    pageSize: 8,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Load categories (first 6 for dashboard preview)
  const { data: categoryData, isLoading: categoriesLoading } = useCategories({
    pageNumber: 0,
    pageSize: 6,
    sortBy: 'categoryName',
    sortOrder: 'asc',
  });

  const { updateStatusMutation } = useProductMutations();

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductResponseDTO | null>(null);
  const [productForImages, setProductForImages] = useState<ProductResponseDTO | null>(null);
  const [productForDetail, setProductForDetail] = useState<ProductResponseDTO | null>(null);

  const products = productData?.content || [];
  const categories = categoryData?.content || [];

  const totalProducts = productData?.totalElements ?? products.length;
  const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalCategories = categoryData?.totalElements ?? categories.length;

  const handleToggleStatus = async (product: ProductResponseDTO) => {
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatusMutation.mutateAsync({
      productId: product.productId,
      status: newStatus,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header with brand and Seller Account Profile Menu */}
      <SellerHeader activeTab="dashboard" />

      {/* Main Dashboard Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-8">
        {/* Welcome & Quick Operational Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Merchant Operations Dashboard 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}. Manage your catalog,
              monitor inventory, and explore product categories.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/dashboard/categories">
              <Button size="sm" variant="secondary">
                <Layers className="h-4 w-4" /> Browse Categories
              </Button>
            </Link>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* ── Merchant Verification Status Alerts (Non-intrusive) ── */}
        {!hasApplication && (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 via-indigo-50/40 to-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" /> Merchant Setup Needed
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Complete Storefront & Compliance Onboarding
                </h3>
                <p className="text-xs text-gray-600 max-w-xl">
                  Set up your brand profile, tax records, bank details, documents, and business address via the Seller Account menu in the top-right corner.
                </p>
              </div>
              <Link to="/dashboard/profile">
                <Button size="sm">
                  Complete Profile <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isDraft && (
          <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                  Application Draft
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {application?.storeName} ({application?.storeSlug})
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Finish & Submit Your Merchant Application
              </h3>
              <p className="text-xs text-gray-500">
                Your profile draft is saved. Review details and submit for verification.
              </p>
            </div>
            <Link to="/dashboard/profile">
              <Button size="sm" variant="secondary">
                Resume Setup <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {isChangesRequired && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Action Required on Profile
              </span>
              <h3 className="text-sm font-bold text-amber-950">
                Reviewer Requested Application Updates
              </h3>
              <p className="text-xs text-amber-800">
                {application?.rejectionReason || 'Please review your application fields and update per reviewer guidelines.'}
              </p>
            </div>
            <Link to="/dashboard/profile">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                Edit & Resubmit <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {isSubmittedOrReview && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Application Under Review
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                Storefront Submitted for Compliance Verification
              </h3>
              <p className="text-xs text-gray-500">
                Our verification team is reviewing your entity records.
              </p>
            </div>
            <Link to="/dashboard/profile">
              <Button size="sm" variant="secondary">
                View Status
              </Button>
            </Link>
          </div>
        )}

        {/* ── Key Business Metrics Bar ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/dashboard/products"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="text-xs font-medium text-gray-400 block">Total Catalog Products</span>
            <span className="text-2xl font-bold text-gray-900 font-mono mt-1 block">
              {totalProducts}
            </span>
          </Link>

          <Link
            to="/dashboard/products"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="text-xs font-medium text-gray-400 block">Active Online</span>
            <span className="text-2xl font-bold text-emerald-600 font-mono mt-1 block">
              {activeProducts}
            </span>
          </Link>

          <Link
            to="/dashboard/products"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Boxes className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="text-xs font-medium text-gray-400 block">Total Units in Stock</span>
            <span className="text-2xl font-bold text-gray-900 font-mono mt-1 block">
              {totalUnits}
            </span>
          </Link>

          <Link
            to="/dashboard/categories"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Layers className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <span className="text-xs font-medium text-gray-400 block">Marketplace Categories</span>
            <span className="text-2xl font-bold text-purple-700 font-mono mt-1 block">
              {totalCategories}
            </span>
          </Link>
        </div>

        {/* ── SECTION 1: Product Management Quick View ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Package className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recent Products & Inventory</h2>
            </div>
            <Link
              to="/dashboard/products"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All Products ({totalProducts})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-gray-200 bg-white p-4 animate-pulse space-y-3"
                >
                  <div className="h-32 rounded-xl bg-gray-200" />
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center space-y-3 shadow-sm">
              <Package className="h-8 w-8 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900">No products added yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Start listing your inventory to reach buyers on the Avenquo marketplace.
              </p>
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <PlusCircle className="h-4 w-4" /> Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => {
                const primaryImage =
                  product.images?.find((img) => img.primaryImage) || product.images?.[0];

                return (
                  <div
                    key={product.productId}
                    className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm hover:border-brand-300 hover:shadow-md transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                        {primaryImage ? (
                          <img
                            src={primaryImage.imageUrl}
                            alt={product.productName}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-300" />
                        )}
                        <div className="absolute top-2 right-2">
                          <ProductStatusBadge status={product.status} size="sm" />
                        </div>
                      </div>

                      <div>
                        <h4
                          onClick={() => setProductForDetail(product)}
                          className="text-xs font-bold text-gray-900 truncate hover:text-brand-600 cursor-pointer"
                          title={product.productName}
                        >
                          {product.productName}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono mt-0.5">
                          <span>SKU: {product.sku}</span>
                          <span
                            className={
                              product.quantity === 0
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-600'
                            }
                          >
                            {product.quantity} in stock
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-brand-700 font-mono">
                          ₹{Number(product.specialPrice).toFixed(2)}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-[10px] text-gray-400 line-through font-mono">
                            ₹{Number(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setProductForDetail(product)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductToEdit(product)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                        title="Edit product"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductForImages(product)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                        title="Manage images"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product)}
                        className={`flex-1 py-1 px-2 rounded-lg font-medium text-[11px] transition-colors ${
                          product.status === 'ACTIVE'
                            ? 'bg-gray-100 hover:bg-amber-50 text-gray-700 hover:text-amber-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Power className="h-3 w-3 inline mr-1" />
                        {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── SECTION 2: Category Management & Explorer ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Explore Marketplace Categories</h2>
            </div>
            <Link
              to="/dashboard/categories"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl border border-gray-200 bg-white p-3 animate-pulse space-y-2"
                >
                  <div className="h-16 rounded-lg bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.categoryId}
                  to={`/dashboard/products?new=1&categoryId=${cat.categoryId}`}
                  className="group flex flex-col items-center text-center rounded-xl border border-gray-200 bg-white p-3 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all"
                >
                  <div className="h-16 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-100 mb-2 flex items-center justify-center">
                    {cat.categoryImageUrl ? (
                      <img
                        src={cat.categoryImageUrl}
                        alt={cat.categoryName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Layers className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-900 group-hover:text-brand-600 truncate w-full">
                    {cat.categoryName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                    #{cat.categoryId}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── SECTION 3: Orders & Fulfillment Preview Card ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Orders & Fulfillment Manifests</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Orders dispatch when buyers complete checkout for active listings. Ensure return windows and quantities are kept up to date.
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-medium">
            {isApproved ? '0 pending dispatches' : 'Requires approved merchant profile'}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProductFormModal
        isOpen={isCreateOpen || Boolean(productToEdit)}
        onClose={() => {
          setIsCreateOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <ProductImageManagerModal
        product={productForImages}
        onClose={() => setProductForImages(null)}
      />

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

export default SellerDashboardPage;
