import { createContext, useContext, useEffect, useReducer } from "react";
import { getTotals } from "../utils/cartMath";

const STORAGE_KEY = "quickkart-cart";
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const found = state.find((item) => item.id === action.product.id);
      if (found) {
        return state.map((item) =>
          item.id === found.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...state, { ...action.product, qty: 1 }];
    }
    case "DECREASE":
      return state
        .map((item) => (item.id === action.id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0);
    case "REMOVE":
      return state.filter((item) => item.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// read the saved cart, but don't crash if storage is blocked or has bad data
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage full or blocked, cart still works in memory
    }
  }, [cart]);

  const value = {
    cart,
    ...getTotals(cart),
    addToCart: (product) => dispatch({ type: "ADD", product }),
    decreaseQty: (id) => dispatch({ type: "DECREASE", id }),
    removeFromCart: (id) => dispatch({ type: "REMOVE", id }),
    clearCart: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
// oxlint-disable-next-line react/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

