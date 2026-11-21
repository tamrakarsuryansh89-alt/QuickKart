
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        QuickKart
      </Link>

      <p className="tagline">
        Exam essentials at your door in 10 minutes
      </p>

      <nav className="nav-links">
        {isAuthenticated ? (
          <>
            <span className="welcome-user">
              Hi, {user?.name}
            </span>

            <Link to="/orders" className="orders-link">
              My Orders
            </Link>

            <button
              type="button"
              className="logout-link"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="orders-link">
              Login
            </Link>

            <Link to="/register" className="orders-link">
              Register
            </Link>
          </>
        )}

        <Link to="/cart" className="cart-link">
          Cart ({totalItems})
        </Link>
      </nav>
    </header>
  );
}
