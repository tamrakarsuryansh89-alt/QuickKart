import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { CartProvider } from "../context/CartContext";

// renders the whole app at a given route, same providers as main.jsx
export function renderApp(route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <CartProvider>
        <App />
      </CartProvider>
    </MemoryRouter>
  );
}
