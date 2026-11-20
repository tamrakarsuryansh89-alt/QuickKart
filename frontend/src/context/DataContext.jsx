import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { statusLabel } from '../utils/orderStatus';
import { shortId } from '../utils/format';

const CHECKLIST_KEY = 'quickart_checklist';

const DEFAULT_CHECKLIST = {
  loginJwt: false,
  protectedDashboard: false,
  ordersTableDetails: false,
  customerSearchFilter: false,
  pagination: false,
  updateOrderStatus: false,
  productListing: false,
  addEditDeleteProducts: false,
  testAdminCustomerRestriction: false,
};

const DataContext = createContext(null);

function toProductPayload(product) {
  return {
    name: product.name.trim(),
    desc: (product.desc || '').trim(),
    price: Number(product.price),
    category: product.category.trim(),
    icon: product.icon,
    time: product.time.trim(),
  };
}

export function DataProvider({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [checklist, setChecklist] = useState(() => {
    try {
      return { ...DEFAULT_CHECKLIST, ...JSON.parse(localStorage.getItem(CHECKLIST_KEY)) };
    } catch {
      return DEFAULT_CHECKLIST;
    }
  });

  useEffect(() => {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklist));
  }, [checklist]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 5);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const markChecklistItem = useCallback((key, value = true) => {
    setChecklist((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [productList, orderList] = await Promise.all([api.listProducts(), api.listOrders()]);
      setProducts(Array.isArray(productList) ? productList : []);
      setOrders(Array.isArray(orderList) ? orderList : []);
      setLastSynced(new Date());
      return true;
    } catch (error) {
      setLoadError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      refresh();
    } else {
      setProducts([]);
      setOrders([]);
      setLastSynced(null);
      setLoadError(null);
    }
  }, [isAuthenticated, isAdmin, refresh]);

  const addProduct = async (product) => {
    try {
      const created = await api.createProduct(toProductPayload(product));
      setProducts((prev) => [created, ...prev]);
      addToast(`Added "${created.name}" to the catalogue`, 'success');
      markChecklistItem('addEditDeleteProducts', true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id, product) => {
    try {
      const updated = await api.updateProduct(id, toProductPayload(product));
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addToast(`Saved changes to "${updated.name}"`, 'info');
      markChecklistItem('addEditDeleteProducts', true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    const product = products.find((p) => p.id === id);
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addToast(`Deleted "${product?.name || 'product'}"`, 'warning');
      markChecklistItem('addEditDeleteProducts', true);
      return { success: true };
    } catch (error) {
      addToast(`Could not delete: ${error.message}`, 'error', 5000);
      return { success: false, error: error.message };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      addToast(`Order ${shortId(orderId)} is now ${statusLabel(updated.status)}`, 'info');
      markChecklistItem('updateOrderStatus', true);
      return { success: true, order: updated };
    } catch (error) {
      addToast(`Could not update order: ${error.message}`, 'error', 5000);
      return { success: false, error: error.message };
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        loading,
        loadError,
        lastSynced,
        refresh,
        toasts,
        checklist,
        addToast,
        removeToast,
        markChecklistItem,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
