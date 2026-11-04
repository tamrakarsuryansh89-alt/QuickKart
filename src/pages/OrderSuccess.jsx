import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return (
      <main className="container empty-page">
        <h2>No recent order</h2>
        <Link to="/" className="btn-primary">Go shopping</Link>
      </main>
    );
  }

  return (
    <main className="container empty-page">
      <h2>Order placed, {order.customer}</h2>
      <p>
        {order.itemCount} item(s) are on the way. Keep ₹{order.total} ready.
      </p>
      <p className="order-id">Order ID: {order.id}</p>
      <Link to="/" className="btn-primary">Keep shopping</Link>
    </main>
  );
}
