export const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const STATUS_LABELS = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const NEXT_STATUSES = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export const statusLabel = (status) => STATUS_LABELS[status] || status || 'Unknown';

export const nextStatuses = (status) => NEXT_STATUSES[status] || [];

export const isOpenOrder = (status) => !['DELIVERED', 'CANCELLED'].includes(status);
