const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

let authToken = null;
let unauthorizedHandler = () => {};

export function setAuthToken(token) {
  authToken = token;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorMessage(response) {
  const text = await response.text().catch(() => '');
  if (!text) return '';
  try {
    const data = JSON.parse(text);
    if (typeof data === 'string') return data;
    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors
        .map((e) => e.defaultMessage || e.message)
        .filter(Boolean)
        .join('. ');
    }
    return data.message || data.detail || data.error || '';
  } catch {
    return text;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${API_BASE}/api/v1${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Cannot reach the QuickKart server. Check that the backend is running on port 8080.',
      0
    );
  }

  if (response.ok) {
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  if (auth && (response.status === 401 || response.status === 403)) {
    unauthorizedHandler(response.status);
    throw new ApiError(
      response.status === 401
        ? 'Your session has expired. Please sign in again.'
        : 'This action needs an admin account.',
      response.status
    );
  }

  const message = await readErrorMessage(response);
  throw new ApiError(message || `Request failed (${response.status})`, response.status);
}

const encode = encodeURIComponent;

export const api = {
  health: () => request('/health', { auth: false }),

  login: async (email, password) => {
    try {
      return await request('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        throw new ApiError('That email and password do not match an account.', error.status);
      }
      throw error;
    }
  },

  listProducts: () => request('/products', { auth: false }),
  createProduct: (product) => request('/products', { method: 'POST', body: product }),
  updateProduct: (id, product) =>
    request(`/products/${encode(id)}`, { method: 'PUT', body: product }),
  deleteProduct: (id) => request(`/products/${encode(id)}`, { method: 'DELETE' }),

  listOrders: () => request('/admin/orders'),
  updateOrderStatus: (id, status) =>
    request(`/admin/orders/${encode(id)}/status`, { method: 'PUT', body: { status } }),
};
