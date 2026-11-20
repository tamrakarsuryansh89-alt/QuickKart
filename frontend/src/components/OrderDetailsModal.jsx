import React, { useEffect } from 'react';
import { Package, Calendar, X, UserRound, Phone, MapPin, Hash } from 'lucide-react';
import StatusBadge from './StatusBadge';
import OrderStatusControl from './OrderStatusControl';
import Avatar from './Avatar';
import { formatINR, formatDate, shortId } from '../utils/format';

export default function OrderDetailsModal({ order, onClose, onUpdateStatus }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.querySelector('[role="alertdialog"]')) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!order) return null;
  const items = order.items || [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-brand-500 to-pink-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/25">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="order-title" className="text-lg font-bold font-display text-white">
                  Order {shortId(order.id)}
                </h3>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs text-white/90 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Placed on {formatDate(order.createdAt, true)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close order details"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                Order status
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Orders move forward one step at a time and cannot go back.
              </p>
            </div>
            <OrderStatusControl order={order} onChange={onUpdateStatus} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <UserRound className="w-4 h-4 text-brand-600" />
                Customer
              </h4>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={order.customer} size="lg" />
                <p className="text-sm font-semibold text-slate-900">{order.customer}</p>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.phone}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-500" />
                Delivery address
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{order.address}</p>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Pincode {order.pincode}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-brand-600" />
              Items ({order.itemCount})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={`${item.productId}-${index}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <span className="text-[11px] font-mono text-slate-400">
                          {shortId(item.productId)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-700 font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 whitespace-nowrap">
                        {formatINR(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatINR(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-50 to-pink-50 rounded-xl p-4 border border-slate-200/80 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Order total</span>
            <span className="text-brand-700 font-display font-bold text-lg">
              {formatINR(order.total)}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">
              Esc
            </kbd>{' '}
            to close
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 font-medium text-xs rounded-lg shadow-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
