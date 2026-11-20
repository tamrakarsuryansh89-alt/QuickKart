import React from 'react';
import {
  ClipboardList,
  BadgeCheck,
  RefreshCw,
  Truck,
  CircleCheck,
  CircleX,
} from 'lucide-react';
import { statusLabel } from '../utils/orderStatus';

const STYLES = {
  PLACED: {
    icon: ClipboardList,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    iconClass: 'text-amber-500',
  },
  CONFIRMED: {
    icon: BadgeCheck,
    className: 'bg-sky-50 text-brand-700 border-sky-200',
    iconClass: 'text-brand-500',
  },
  PROCESSING: {
    icon: RefreshCw,
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconClass: 'text-indigo-500',
  },
  OUT_FOR_DELIVERY: {
    icon: Truck,
    className: 'bg-pink-50 text-pink-700 border-pink-200',
    iconClass: 'text-pink-500',
  },
  DELIVERED: {
    icon: CircleCheck,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconClass: 'text-emerald-500',
  },
  CANCELLED: {
    icon: CircleX,
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    iconClass: 'text-rose-500',
  },
};

export default function StatusBadge({ status }) {
  const style = STYLES[status];
  if (!style) {
    return (
      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {statusLabel(status)}
      </span>
    );
  }
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium border ${style.className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${style.iconClass}`} strokeWidth={2} />
      {statusLabel(status)}
    </span>
  );
}
