import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="navbar">
      <Link to="/" className="logo">QuickKart</Link>
      <p className="tagline">Exam essentials at your door in 10 minutes</p>
      <Link to="/cart" className="cart-link">
        Cart ({totalItems})
      </Link>
    </header>
  );
}
