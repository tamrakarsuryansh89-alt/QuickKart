// Delivery is free once the order crosses this amount
export const FREE_DELIVERY_ABOVE = 199;
export const DELIVERY_FEE = 25;

export function getDeliveryFee(itemTotal) {
  if (itemTotal === 0 || itemTotal > FREE_DELIVERY_ABOVE) return 0;
  return DELIVERY_FEE;
}

export function getTotals(cart) {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const itemTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = getDeliveryFee(itemTotal);

  return {
    totalItems,
    itemTotal,
    deliveryFee,
    grandTotal: itemTotal + deliveryFee,
  };
}