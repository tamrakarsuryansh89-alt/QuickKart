import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Clock, Funnel, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import Pagination from '../components/Pagination';
import ProductModal from '../components/ProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { SyncErrorBanner, LoadingRows } from '../components/DataState';
import { formatINR } from '../utils/format';
import { productIcon } from '../utils/productMeta';

const SORT_OPTIONS = [
  { label: 'Name A to Z', value: 'name_asc' },
  { label: 'Name Z to A', value: 'name_desc' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
];

export default function ProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct, markChecklistItem } =
    useData();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    markChecklistItem('productListing', true);
  }, [markChecklistItem]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products
      .filter((p) => {
        const matchCategory = category === 'All' || p.category === category;
        const matchSearch =
          !q ||
          (p.name || '').toLowerCase().includes(q) ||
          (p.desc || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q);
        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'name_desc':
            return (b.name || '').localeCompare(a.name || '');
          default:
            return (a.name || '').localeCompare(b.name || '');
        }
      });
  }, [products, search, category, sortBy]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, category, sortBy, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSave = (form) =>
    editingProduct ? updateProduct(editingProduct.id, form) : addProduct(form);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingProduct(null);
  }, []);

  const cancelDelete = useCallback(() => setProductToDelete(null), []);

  const hasFilters = search || category !== 'All' || sortBy !== 'name_asc';

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSortBy('name_asc');
  };

  const isInitialLoad = loading && products.length === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Products</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage what customers can order on the storefront.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 border border-pink-200 px-3.5 py-2 rounded-xl transition"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          )}
          <button
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white rounded-xl shadow-md transition hover:-translate-y-0.5 btn-brand-gradient"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>
      </div>

      <SyncErrorBanner />

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, description or category"
              aria-label="Search products"
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-500 bg-slate-50/70 focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative min-w-[190px]">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full appearance-none pl-9 pr-8 py-2.5 text-xs font-semibold border border-slate-200 bg-white rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[190px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="w-full appearance-none pl-9 pr-8 py-2.5 text-xs font-semibold border border-slate-200 bg-white rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {hasFilters && (
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            Showing <strong className="text-slate-800">{totalItems}</strong> of {products.length}{' '}
            products
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {isInitialLoad ? (
          <LoadingRows rows={6} columns={5} />
        ) : pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-brand-600 flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">
                {products.length === 0 ? 'No products yet' : 'No products match your filters'}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {products.length === 0
                  ? 'Add your first product to start selling.'
                  : 'Try another category or clear the search.'}
              </p>
            </div>
            {products.length === 0 ? (
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm"
              >
                Add product
              </button>
            ) : (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="bg-sky-50/60 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 whitespace-nowrap">Product</th>
                  <th className="px-4 py-3 whitespace-nowrap">Category</th>
                  <th className="px-4 py-3 whitespace-nowrap">Price</th>
                  <th className="px-4 py-3 whitespace-nowrap">Delivery</th>
                  <th className="px-5 py-3 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((product, index) => {
                  const Icon = productIcon(product.icon);
                  const pink = index % 2 === 1;
                  return (
                    <tr key={product.id} className="hover:bg-sky-50/40 transition">
                      <td className="px-5 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border ${
                              pink
                                ? 'bg-pink-50 text-pink-600 border-pink-100'
                                : 'bg-sky-50 text-brand-600 border-sky-100'
                            }`}
                          >
                            <Icon className="w-6 h-6" strokeWidth={1.7} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[320px] leading-tight">
                              {product.name}
                            </p>
                            {product.desc && (
                              <p className="text-xs text-slate-500 truncate max-w-[320px] mt-0.5">
                                {product.desc}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="inline-block text-xs font-semibold text-brand-700 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-xl">
                          {product.category || 'Uncategorised'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-display">
                          {formatINR(product.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-pink-400" />
                          {product.time || 'Not set'}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-middle whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setModalOpen(true);
                            }}
                            aria-label={`Edit ${product.name}`}
                            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:bg-sky-50 border border-sky-200 px-2.5 py-1.5 rounded-xl transition"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalItems > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            itemName="products"
          />
        )}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editingProduct={editingProduct}
        categories={categories}
      />

      <ConfirmDialog
        open={Boolean(productToDelete)}
        icon={Trash2}
        tone="danger"
        title="Delete this product?"
        message={
          <>
            <strong className="text-slate-700">"{productToDelete?.name}"</strong> will be removed
            from the storefront. This cannot be undone.
          </>
        }
        confirmLabel="Delete product"
        onCancel={cancelDelete}
        onConfirm={async () => {
          await deleteProduct(productToDelete.id);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
