import { getDeliveryFee, getTotals, DELIVERY_FEE } from "./cartMath";

describe("getDeliveryFee", () => {
  it("is free for an empty cart", () => {
    expect(getDeliveryFee(0)).toBe(0);
  });

  it("charges the fee on small orders", () => {
    expect(getDeliveryFee(100)).toBe(DELIVERY_FEE);
  });

  it("charges the fee at exactly 199 and is free from 200", () => {
    expect(getDeliveryFee(199)).toBe(DELIVERY_FEE);
    expect(getDeliveryFee(200)).toBe(0);
  });
});

describe("getTotals", () => {
  it("adds up items and price with quantity", () => {
    const cart = [
      { id: 1, price: 50, qty: 2 },
      { id: 2, price: 30, qty: 1 },
    ];
    expect(getTotals(cart)).toEqual({
      totalItems: 3,
      itemTotal: 130,
      deliveryFee: DELIVERY_FEE,
      grandTotal: 130 + DELIVERY_FEE,
    });
  });

  it("returns zeros for an empty cart", () => {
    expect(getTotals([])).toEqual({ totalItems: 0, itemTotal: 0, deliveryFee: 0, grandTotal: 0 });
  });
});