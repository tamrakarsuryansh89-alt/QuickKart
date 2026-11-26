
import React, { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw, Search, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useData } from '../context/DataContext';
import { api } from '../api/client';
import { SyncErrorBanner } from '../components/DataState';

export default function InventoryPage() {
  const { products, refresh, loading, addToast } = useData();

  const [search, setSearch] = useState('');
  const [lowStockIds, setLowStockIds] = useState([]);
  const [stockValues, setStockValues] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const loadLowStock = async () => {
    try {
      const data = await api.listLowStockProducts();
      setLowStockIds(
        Array.isArray(data) ? data.map((product) => product.id) : []
      );
    } catch (error) {
      addToast(`Could not load low-stock products: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    loadLowStock();
  }, []);

  useEffect(() => {
    setStockValues((prev) => {
      const next = { ...prev };

      products.forEach((product) => {
        if (!next[product.id]) {
          next[product.id] = {
            stockQuantity: product.stockQuantity ?? 0,
            lowStockThreshold: product.lowStockThreshold ?? 5,
          };
        }
      });

      return next;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) =>
      (product.name || '').toLowerCase().includes(query)
    );
  }, [products, search]);

  const lowStockCount = lowStockIds.length;

  const handleChange = (id, field, value) => {
    setStockValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (product) => {
    const values = stockValues[product.id];

    const stockQuantity = Number(values?.stockQuantity);
    const lowStockThreshold = Number(values?.lowStockThreshold);

    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0 ||
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0
    ) {
      addToast('Stock and threshold must be valid non-negative whole numbers.', 'error');
      return;
    }

    setSavingId(product.id);

    try {
      await api.updateInventory(product.id, {
        stockQuantity,
        lowStockThreshold,
      });

      await refresh();
      await loadLowStock();

      addToast(`Inventory updated for ${product.name}`, 'success');
    } catch (error) {
      addToast(`Inventory update failed: ${error.message}`, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const isLowStock = (product) =>
    lowStockIds.includes(product.id) ||
    (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 5);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Inventory Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitor product stock and manage inventory levels.
          </p>
        </div>

        <button
          onClick={async () => {
            setInventoryLoading(true);
            await refresh();
            await loadLowStock();
            setInventoryLoading(false);
          }}
          disabled={inventoryLoading || loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${inventoryLoading ? 'animate-spin' : ''}`} />
          Refresh inventory
        </button>
      </div>

      <SyncErrorBanner />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Stock Products</p>
              <p className="text-2xl font-bold text-rose-600">{lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Healthy Stock</p>
              <p className="text-2xl font-bold text-emerald-600">
                {products.length - lowStockCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Product Stock</h3>
          <p className="text-xs text-slate-500 mt-1">
            Update stock quantity and low-stock alert threshold.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-4 py-4">Current Stock</th>
                <th className="px-4 py-4">Low Stock Threshold</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const values = stockValues[product.id] || {
                  stockQuantity: product.stockQuantity ?? 0,
                  lowStockThreshold: product.lowStockThreshold ?? 5,
                };

                const low = isLowStock(product);

                return (
                  <tr key={product.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={values.stockQuantity}
                        onChange={(e) =>
                          handleChange(product.id, 'stockQuantity', e.target.value)
                        }
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={values.lowStockThreshold}
                        onChange={(e) =>
                          handleChange(product.id, 'lowStockThreshold', e.target.value)
                        }
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </td>

                    <td className="px-4 py-4">
                      {low ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50">
                          <CheckCircle className="w-3.5 h-3.5" />
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleSave(product)}
                        disabled={savingId === product.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {savingId === product.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
