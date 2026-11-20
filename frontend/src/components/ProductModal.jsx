import React, { useEffect, useState } from 'react';
import { X, IndianRupee, Clock, CircleAlert } from 'lucide-react';
import { CATEGORIES, ICON_NAMES, PRODUCT_ICONS, validateProduct } from '../utils/productMeta';

const BLANK = {
  name: '',
  desc: '',
  price: '',
  category: CATEGORIES[0],
  icon: ICON_NAMES[0],
  time: '10 mins',
};

function Field({ label, required, error, hint, children, htmlFor }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
          <CircleAlert className="w-3.5 h-3.5" /> {error}
        </p>
      ) : (
        hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

const inputClass = (error) =>
  `w-full px-3 py-2 text-sm rounded-lg border ${
    error ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 bg-white'
  } focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500`;

export default function ProductModal({ isOpen, onClose, onSave, editingProduct, categories }) {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      editingProduct
        ? {
            name: editingProduct.name || '',
            desc: editingProduct.desc || '',
            price: editingProduct.price != null ? String(editingProduct.price) : '',
            category: editingProduct.category || CATEGORIES[0],
            icon: PRODUCT_ICONS[editingProduct.icon] ? editingProduct.icon : ICON_NAMES[0],
            time: editingProduct.time || '',
          }
        : BLANK
    );
    setErrors({});
    setSubmitError('');
    setSaving(false);
  }, [editingProduct, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateProduct(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setSubmitError('');
    const result = await onSave(form);
    setSaving(false);
    if (result?.success) onClose();
    else setSubmitError(result?.error || 'Something went wrong. Please try again.');
  };

  const categoryOptions = [...new Set([...CATEGORIES, ...(categories || []), form.category])].filter(
    Boolean
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={saving ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-pink-50">
          <div>
            <h3 id="product-modal-title" className="text-lg font-bold text-slate-900 font-display">
              {editingProduct ? 'Edit product' : 'Add a new product'}
            </h3>
            <p className="text-xs text-slate-500">
              {editingProduct
                ? 'Changes appear on the storefront as soon as you save.'
                : 'The product will be listed on the QuickKart storefront.'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {submitError && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2"
            >
              <CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <Field label="Product name" required error={errors.name} htmlFor="p-name">
            <input
              id="p-name"
              type="text"
              autoFocus
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Exam Essentials Kit"
              className={inputClass(errors.name)}
            />
          </Field>

          <Field label="Description" htmlFor="p-desc" hint="A short line shown under the product name.">
            <textarea
              id="p-desc"
              rows={2}
              value={form.desc}
              onChange={(e) => update('desc', e.target.value)}
              placeholder="e.g. 2 pens, pencil, eraser, scale and sharpener"
              className={inputClass(false)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Price" required error={errors.price} htmlFor="p-price">
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="p-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                  placeholder="149"
                  className={`${inputClass(errors.price)} pl-8`}
                />
              </div>
            </Field>

            <Field label="Category" required error={errors.category} htmlFor="p-category">
              <select
                id="p-category"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className={`${inputClass(errors.category)} cursor-pointer`}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Delivery time" required error={errors.time} htmlFor="p-time">
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="p-time"
                  type="text"
                  value={form.time}
                  onChange={(e) => update('time', e.target.value)}
                  placeholder="10 mins"
                  className={`${inputClass(errors.time)} pl-8`}
                />
              </div>
            </Field>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Icon
            </span>
            <div className="grid grid-cols-7 gap-2" role="radiogroup" aria-label="Product icon">
              {ICON_NAMES.map((name) => {
                const Icon = PRODUCT_ICONS[name];
                const selected = form.icon === name;
                return (
                  <button
                    type="button"
                    key={name}
                    role="radio"
                    aria-checked={selected}
                    title={name}
                    onClick={() => update('icon', name)}
                    className={`h-11 rounded-xl border flex items-center justify-center transition ${
                      selected
                        ? 'border-brand-500 bg-sky-50 text-brand-600 ring-2 ring-brand-200'
                        : 'border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-70"
            >
              {saving && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {saving ? 'Saving...' : editingProduct ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
