import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./CartContext";

const pen = { id: 3, name: "Gel Pens", price: 50 };
const ruler = { id: 11, name: "Ruler", price: 25 };

const setup = () => renderHook(() => useCart(), { wrapper: CartProvider });

describe("CartContext", () => {
  it("adds a new product with qty 1", () => {
    const { result } = setup();
    act(() => result.current.addToCart(pen));
    expect(result.current.cart).toEqual([{ ...pen, qty: 1 }]);
  });

  it("adding the same product again raises qty", () => {
    const { result } = setup();
    act(() => result.current.addToCart(pen));
    act(() => result.current.addToCart(pen));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].qty).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  it("decrease removes the item when qty hits zero", () => {
    const { result } = setup();
    act(() => result.current.addToCart(pen));
    act(() => result.current.decreaseQty(pen.id));
    expect(result.current.cart).toEqual([]);
  });

  it("removeFromCart drops only that product", () => {
    const { result } = setup();
    act(() => result.current.addToCart(pen));
    act(() => result.current.addToCart(ruler));
    act(() => result.current.removeFromCart(pen.id));
    expect(result.current.cart.map((i) => i.id)).toEqual([ruler.id]);
  });

  it("clearCart empties everything", () => {
    const { result } = setup();
    act(() => result.current.addToCart(pen));
    act(() => result.current.clearCart());
    expect(result.current.cart).toEqual([]);
    expect(result.current.grandTotal).toBe(0);
  });

  it("saves the cart in localStorage", () => {
    const { result } = setup();
    act(() => result.current.addToCart(pen));
    const saved = JSON.parse(localStorage.getItem("quickkart-cart"));
    expect(saved).toEqual([{ ...pen, qty: 1 }]);
  });

  it("loads a saved cart on start", () => {
    localStorage.setItem("quickkart-cart", JSON.stringify([{ ...ruler, qty: 3 }]));
    const { result } = setup();
    expect(result.current.totalItems).toBe(3);
  });

  it("ignores broken data in localStorage", () => {
    localStorage.setItem("quickkart-cart", "{not json");
    const { result } = setup();
    expect(result.current.cart).toEqual([]);
  });
});
