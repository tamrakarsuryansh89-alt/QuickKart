
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Please login to view order details.");
        }

        const response = await fetch(
          `http://localhost:8080/api/v1/orders/${id}`,
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
              ? "Session expired or access denied."
              : "Order not found"
          );
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, token]);

  // Cancel order
  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancelling(true);
      setCancelError("");

      const response = await fetch(
        `http://localhost:8080/api/v1/orders/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to cancel order");
      }

      const updatedOrder = await response.json();

      setOrder(updatedOrder);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <h2>Loading order details...</h2>;
  if (error) return <h2>Error: {error}</h2>;
  if (!order) return <h2>Order not found</h2>;

  return (
    <div className="orders-page">
      <Link to="/orders">← Back to My Orders</Link>

      <h1>Order Details</h1>

      <div className="order-card">
        <h3>Order #{order.id}</h3>

        <p>
          Status: <strong>{order.status}</strong>
        </p>

        <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

        <h3>Customer Details</h3>
        <p>Name: {order.customer}</p>
        <p>Phone: {order.phone}</p>

        <h3>Delivery Address</h3>
        <p>{order.address}</p>
        <p>Pincode: {order.pincode}</p>

        <h3>Ordered Products</h3>

        {order.items?.map((item, index) => (
          <p key={index}>
            {item.name} × {item.quantity} — ₹{item.subtotal}
          </p>
        ))}

        <h2>Total Bill: ₹{order.total}</h2>

        {cancelError && (
          <p style={{ color: "red" }}>{cancelError}</p>
        )}

        {order.status?.toUpperCase() === "PLACED" && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="cancel-order-btn"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

        {order.status?.toUpperCase() === "CANCELLED" && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            This order has been cancelled.
          </p>
        )}
      </div>
    </div>
  );
}
