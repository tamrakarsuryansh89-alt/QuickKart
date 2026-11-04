import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FREE_DELIVERY_ABOVE } from "../utils/cartMath";
import QtyControl from "../components/QtyControl";
import ProductIcon from "../components/ProductIcon";

export default function Cart() {
  const { cart, addToCart, decreaseQty, removeFromCart, itemTotal, deliveryFee, grandTotal } = useCart();

  if (cart.length === 0) {
    return (
      <main className="container empty-page">
        <h2>Your cart is empty</h2>
        <p>Add your exam items and they will show up here.</p>
        <Link to="/" className="btn-primary">Browse products</Link>
      </main>
    );
  }

  const amountLeft = FREE_DELIVERY_ABOVE + 1 - itemTotal;

  return (
    <main className="container">
      <h2>Your cart</h2>

      {cart.map((item) => (
        <div className="cart-row" key={item.id}>
        <ProductIcon name={item.icon} category={item.category} size="small" />
          <div className="row-info">
            <h4>{item.name}</h4>
            <p>₹{item.price} each</p>
          </div>
          <QtyControl
            name={item.name}
            qty={item.qty}
            onPlus={() => addToCart(item)}
            onMinus={() => decreaseQty(item.id)}
          />
          <strong className="row-total">₹{item.price * item.qty}</strong>
          <button className="btn-remove" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
            Remove
          </button>
        </div>
      ))}

      <div className="bill">
        {deliveryFee > 0 && (
          <p className="nudge">Add ₹{amountLeft} more for free delivery</p>
        )}
        <div className="bill-line"><span>Item total</span><span>₹{itemTotal}</span></div>
        <div className="bill-line">
          <span>Delivery</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="bill-line bill-grand"><span>To pay</span><span>₹{grandTotal}</span></div>
        <Link to="/checkout" className="btn-primary wide">Go to checkout</Link>
      </div>
    </main>
  );
}
