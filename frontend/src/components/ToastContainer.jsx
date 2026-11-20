import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useData } from '../context/DataContext';

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />
  };

  const borders = {
    success: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
    error: 'border-l-rose-500',
    info: 'border-l-blue-500'
  };

  return (
    <div
      className={`flex items-start gap-3 bg-white border border-slate-200 ${borders[toast.type] || 'border-l-blue-500'} border-l-4 rounded-xl px-4 py-3 shadow-lg max-w-sm text-sm text-slate-700 animate-slideInRight backdrop-blur-sm`}
      role="alert"
    >
      {icons[toast.type] || icons.info}
      <span className="flex-1 font-medium leading-relaxed">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useData();

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
