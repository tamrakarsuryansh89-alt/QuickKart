
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function MyOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8080/api/v1/orders",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401 || response.status === 403
              ? "Session expired. Please login again."
              : "Failed to fetch orders"
          );
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setError("Please login to view your orders.");
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <h2>Loading your orders...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div>
              <h3>Order #{order.id}</h3>
              <span>{order.status}</span>
            </div>

            <p>
              Date: {new Date(order.createdAt).toLocaleString()}
            </p>

            <h4>Items:</h4>

            {order.items.map((item, index) => (
              <p key={index}>
                {item.name} × {item.quantity} — ₹{item.subtotal}
              </p>
            ))}

            <h3>Total: ₹{order.total}</h3>

            <Link
              to={`/orders/${order.id}`}
              className="view-details-link"
            >
              View Details →
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
