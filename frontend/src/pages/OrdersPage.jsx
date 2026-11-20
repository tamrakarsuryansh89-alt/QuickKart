import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowUpDown, Calendar, Eye, ShoppingCart, Phone } from 'lucide-react';
import { useData } from '../context/DataContext';
import Pagination from '../components/Pagination';
import OrderDetailsModal from '../components/OrderDetailsModal';
import OrderStatusControl from '../components/OrderStatusControl';
import Avatar from '../components/Avatar';
import { SyncErrorBanner, LoadingRows } from '../components/DataState';
import { formatINR, formatDate, shortId } from '../utils/format';
import { ORDER_STATUSES, statusLabel } from '../utils/orderStatus';

const STATUS_FILTERS = ['ALL', ...ORDER_STATUSES];

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'date_desc' },
  { label: 'Oldest first', value: 'date_asc' },
  { label: 'Amount: high to low', value: 'amount_desc' },
  { label: 'Amount: low to high', value: 'amount_asc' },
  { label: 'Customer name A to Z', value: 'name_asc' },
];

const time = (value) => new Date(value || 0).getTime();

export default function OrdersPage() {
  const { orders, loading, updateOrderStatus, markChecklistItem } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    markChecklistItem('ordersTableDetails', true);
    markChecklistItem('customerSearchFilter', true);
    markChecklistItem('pagination', true);
  }, [markChecklistItem]);

  const selectedOrder = orders.find((o) => o.id === selectedId) || null;

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    return orders
      .filter((order) => {
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        const matchesSearch =
          !query ||
          (order.id || '').toLowerCase().includes(query) ||
          (order.customer || '').toLowerCase().includes(query) ||
          (order.phone || '').includes(query) ||
          (order.pincode || '').includes(query);
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date_asc':
            return time(a.createdAt) - time(b.createdAt);
          case 'amount_desc':
            return b.total - a.total;
          case 'amount_asc':
            return a.total - b.total;
          case 'name_asc':
            return (a.customer || '').localeCompare(b.customer || '');
          default:
            return time(b.createdAt) - time(a.createdAt);
        }
      });
  }, [orders, search, statusFilter, sortBy]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSortBy('date_desc');
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || sortBy !== 'date_desc';
  const isInitialLoad = loading && orders.length === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Search customer orders and move them through fulfilment.
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 border border-pink-200 px-3.5 py-2 rounded-xl transition"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
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
              placeholder="Search by customer, phone, pincode or order ID"
              aria-label="Search orders"
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

          <div className="relative min-w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort orders"
              className="w-full appearance-none pl-9 pr-8 py-2.5 text-xs font-semibold border border-slate-200 bg-white rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((status) => {
            const count =
              status === 'ALL' ? orders.length : orders.filter((o) => o.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-brand-700'
                }`}
              >
                <span>{status === 'ALL' ? 'All' : statusLabel(status)}</span>
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            Showing <strong className="text-slate-800">{totalItems}</strong> matching orders
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {isInitialLoad ? (
          <LoadingRows rows={6} columns={6} />
        ) : pagedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-brand-600 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {orders.length === 0
                  ? 'Orders placed on the QuickKart storefront will appear here.'
                  : 'Try a different status or clear the search.'}
              </p>
            </div>
            {hasActiveFilters && (
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
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="bg-sky-50/60 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 whitespace-nowrap">Order</th>
                  <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                  <th className="px-4 py-3 whitespace-nowrap">Placed</th>
                  <th className="px-4 py-3 whitespace-nowrap">Items</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Amount</th>
                  <th className="px-5 py-3 whitespace-nowrap text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-sky-50/40 transition">
                    <td className="px-5 py-3 align-middle whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-800" title={order.id}>
                        {shortId(order.id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={order.customer} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
                            {order.customer}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                            <Phone className="w-3 h-3" /> {order.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="text-xs font-medium text-slate-700 whitespace-nowrap">
                        {order.itemCount} {order.itemCount === 1 ? 'unit' : 'units'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {(order.items || []).map((item) => item.name).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap">
                      <OrderStatusControl order={order} onChange={updateOrderStatus} compact />
                    </td>
                    <td className="px-4 py-3 align-middle whitespace-nowrap text-right">
                      <span className="font-bold text-slate-900 font-display">
                        {formatINR(order.total)}
                      </span>
                    </td>
                    <td className="px-5 py-3 align-middle whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedId(order.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-white hover:bg-brand-500 border border-brand-200 hover:border-brand-500 px-3 py-1.5 rounded-xl transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemName="orders"
          />
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedId(null)}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}
