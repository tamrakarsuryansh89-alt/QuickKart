import React, { useEffect, useRef, useState } from 'react';

const TONES = {
  danger: {
    iconWrap: 'bg-rose-50 text-rose-500 border-rose-100',
    button: 'bg-rose-600 hover:bg-rose-700',
  },
  brand: {
    iconWrap: 'bg-sky-50 text-brand-600 border-sky-100',
    button: 'bg-brand-600 hover:bg-brand-700',
  },
};

export default function ConfirmDialog({
  open,
  icon: Icon,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'brand',
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  const busyRef = useRef(false);
  onCancelRef.current = onCancel;
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return undefined;
    setBusy(false);
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busyRef.current) {
        e.stopPropagation();
        onCancelRef.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  if (!open) return null;
  const styles = TONES[tone] || TONES.brand;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
      onClick={busy ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${styles.iconWrap}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="text-center">
          <h3 id="confirm-title" className="text-base font-bold text-slate-900 font-display">
            {title}
          </h3>
          <div className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</div>
        </div>
        <div className="flex gap-2.5 pt-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className={`flex-1 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-70 ${styles.button}`}
          >
            {busy && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
