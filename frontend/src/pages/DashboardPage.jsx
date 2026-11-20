import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  Sparkles,
  ChevronRight,
  CircleCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import { SyncErrorBanner } from '../components/DataState';
import { formatINR, shortId } from '../utils/format';
import { ORDER_STATUSES, statusLabel, isOpenOrder } from '../utils/orderStatus';
import { productIcon } from '../utils/productMeta';

const STAGE_COLORS = {
  PLACED: 'bg-amber-400',
  CONFIRMED: 'bg-brand-400',
  PROCESSING: 'bg-indigo-400',
  OUT_FOR_DELIVERY: 'bg-pink-400',
  DELIVERED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-400',
};

const CHECKLIST_ITEMS = [
  { key: 'loginJwt', label: 'Admin Login + JWT integration' },
  { key: 'protectedDashboard', label: 'Protected Admin Dashboard' },
  { key: 'ordersTableDetails', label: 'Orders table + order details' },
  { key: 'customerSearchFilter', label: 'Customer search + status filter' },
  { key: 'pagination', label: 'Pagination' },
  { key: 'updateOrderStatus', label: 'Update order status' },
  { key: 'productListing', label: 'Product listing' },
  { key: 'addEditDeleteProducts', label: 'Add / Edit / Delete products' },
  { key: 'testAdminCustomerRestriction', label: 'Test ADMIN access and CUSTOMER restriction' },
];

function StatCard({ label, value, sub, icon: Icon, tone, loading }) {
  const pink = tone === 'pink';
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm transition-card flex flex-col justify-between gap-3 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${pink ? 'bg-pink-400' : 'bg-brand-500'}`} />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            pink ? 'bg-pink-50 text-pink-600' : 'bg-sky-50 text-brand-600'
          }`}
        >
          <Icon className="w-5 h-5" strokeWidth={1.9} />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <p className="text-2xl sm:text-3xl font-bold font-display text-slate-900">{value}</p>
        )}
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { orders, products, checklist, markChecklistItem, loading, lastSynced, refresh } =
    useData();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const billable = orders.filter((o) => o.status !== 'CANCELLED');
    const revenue = billable.reduce((sum, o) => sum + (o.total || 0), 0);
    const openOrders = orders.filter((o) => isOpenOrder(o.status));
    const awaiting = orders.filter((o) => o.status === 'PLACED').length;
    const customers = new Set(orders.map((o) => o.userId || o.phone)).size;
    const categories = new Set(products.map((p) => p.category)).size;
    return { revenue, billable, openOrders, awaiting, customers, categories };
  }, [orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [orders]
  );

  const topProducts = useMemo(() => {
    const units = new Map();
    orders
      .filter((o) => o.status !== 'CANCELLED')
      .forEach((o) =>
        (o.items || []).forEach((item) => {
          units.set(item.productId, (units.get(item.productId) || 0) + item.quantity);
        })
      );
    return products
      .map((p) => ({ ...p, unitsSold: units.get(p.id) || 0 }))
      .sort((a, b) => b.unitsSold - a.unitsSold || (a.name || '').localeCompare(b.name || ''))
      .slice(0, 4);
  }, [orders, products]);

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const isInitialLoad = loading && !lastSynced;

  const cards = [
    {
      label: 'Revenue',
      value: formatINR(stats.revenue),
      sub: `From ${stats.billable.length} orders, excluding cancelled`,
      icon: IndianRupee,
    },
    {
      label: 'Open orders',
      value: stats.openOrders.length,
      sub: `${stats.awaiting} waiting to be confirmed`,
      icon: ShoppingCart,
      tone: 'pink',
    },
    {
      label: 'Products',
      value: products.length,
      sub: `Across ${stats.categories} ${stats.categories === 1 ? 'category' : 'categories'}`,
      icon: Package,
    },
    {
      label: 'Customers',
      value: stats.customers,
      sub: 'Who have placed at least one order',
      icon: Users,
      tone: 'pink',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-brand-700 border border-sky-100 inline-flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            QuickKart Operations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Here is how the store is doing right now.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 text-xs bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl px-3.5 py-2 text-slate-600 font-medium transition disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${loading ? 'animate-spin' : ''}`} />
          {loading
            ? 'Syncing...'
            : lastSynced
              ? `Updated ${lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
              : 'Sync now'}
        </button>
      </div>

      <SyncErrorBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} loading={isInitialLoad} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 font-display text-base">Fulfilment pipeline</h3>
              <p className="text-xs text-slate-500 mt-0.5">How many orders are at each stage</p>
            </div>
            <NavLink
              to="/orders"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition group"
            >
              View orders
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </NavLink>
          </div>
          <div className="space-y-3.5">
            {ORDER_STATUSES.map((status) => {
              const count = orders.filter((o) => o.status === status).length;
              const percent = orders.length ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-medium text-slate-700">{statusLabel(status)}</span>
                    <span className="text-slate-600">
                      <span className="font-semibold text-slate-800">{count}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-1.5">{percent}%</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${STAGE_COLORS[status]} transition-all duration-700`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 font-display text-base">Completion checklist</h3>
              <p className="text-xs text-slate-500">Admin frontend progress</p>
            </div>
            <span className="text-2xl font-bold font-display text-brand-gradient">
              {completedCount}/{CHECKLIST_ITEMS.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 bg-brand-gradient"
              style={{ width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%` }}
            />
          </div>
          <ul className="space-y-2">
            {CHECKLIST_ITEMS.map((item) => {
              const done = Boolean(checklist[item.key]);
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => markChecklistItem(item.key, !done)}
                    aria-pressed={done}
                    className="flex items-start gap-2.5 text-left w-full group"
                  >
                    <span
                      className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                        done
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-slate-300 group-hover:border-brand-400 bg-white'
                      }`}
                    >
                      {done && <CircleCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                    </span>
                    <span
                      className={`text-xs leading-relaxed ${
                        done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 font-display text-base">Recent orders</h3>
              <p className="text-xs text-slate-500">The latest five purchases</p>
            </div>
            <NavLink
              to="/orders"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              {isInitialLoad ? 'Loading orders...' : 'No orders have been placed yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-sky-50/60 border-b border-slate-100 text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-sky-50/30 transition">
                      <td className="px-6 py-3.5 font-mono text-slate-700 font-semibold whitespace-nowrap">
                        {shortId(order.id)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={order.customer} size="xs" />
                          <span className="text-slate-800 font-medium truncate max-w-[140px]">
                            {order.customer}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatINR(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 font-display text-base">Top products</h3>
              <p className="text-xs text-slate-500">Ranked by units ordered</p>
            </div>
            <NavLink
              to="/products"
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
            >
              Products
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
          <div className="p-4 space-y-2.5">
            {topProducts.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                {isInitialLoad ? 'Loading products...' : 'No products in the catalogue yet.'}
              </p>
            )}
            {topProducts.map((product, index) => {
              const Icon = productIcon(product.icon);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition"
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        index % 2 ? 'bg-pink-50 text-pink-600' : 'bg-sky-50 text-brand-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <span
                      className={`absolute -top-1 -left-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${
                        index === 0 ? 'bg-pink-500' : 'bg-brand-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900">{formatINR(product.price)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {product.unitsSold} {product.unitsSold === 1 ? 'unit' : 'units'} ordered
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
