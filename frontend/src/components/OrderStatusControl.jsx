import React, { useState } from 'react';
import { ArrowRight, CircleX, Lock } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import StatusBadge from './StatusBadge';
import { nextStatuses, statusLabel } from '../utils/orderStatus';
import { shortId } from '../utils/format';

export default function OrderStatusControl({ order, onChange, compact = false }) {
  const [pending, setPending] = useState(null);
  const options = nextStatuses(order.status);

  if (options.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status={order.status} />
        {!compact && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Lock className="w-3 h-3" /> Final
          </span>
        )}
      </div>
    );
  }

  const isCancel = pending === 'CANCELLED';

  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={order.status} />
      <div className="relative">
        <select
          value=""
          onChange={(e) => e.target.value && setPending(e.target.value)}
          aria-label={`Change status of order ${shortId(order.id)}`}
          className="appearance-none text-xs font-semibold border border-slate-200 bg-white rounded-xl pl-2.5 pr-7 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400 hover:border-brand-300 transition"
        >
          <option value="">Move to...</option>
          {options.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
        <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        icon={isCancel ? CircleX : ArrowRight}
        tone={isCancel ? 'danger' : 'brand'}
        title={isCancel ? 'Cancel this order?' : `Mark as ${statusLabel(pending)}?`}
        message={
          <>
            Order <strong className="text-slate-700">{shortId(order.id)}</strong> for{' '}
            <strong className="text-slate-700">{order.customer}</strong> will move from{' '}
            {statusLabel(order.status)} to {statusLabel(pending)}. Orders cannot move back to an
            earlier status.
          </>
        }
        confirmLabel={isCancel ? 'Cancel order' : `Mark ${statusLabel(pending)}`}
        onCancel={() => setPending(null)}
        onConfirm={async () => {
          await onChange(order.id, pending);
          setPending(null);
        }}
      />
    </div>
  );
}
