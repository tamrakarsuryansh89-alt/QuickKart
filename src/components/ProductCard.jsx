import { useCart } from "../context/CartContext";
import QtyControl from "./QtyControl";
import ProductIcon from "./ProductIcon";

export default function ProductCard({ product }) {
  const { cart, addToCart, decreaseQty } = useCart();
  const inCart = cart.find((item) => item.id === product.id);

  return (
    <article className="card">
      <ProductIcon name={product.icon} category={product.category} />
      <span className="eta">{product.time}</span>
      <h3>{product.name}</h3>
      <p className="desc">{product.desc}</p>

      <div className="card-bottom">
        <span className="price">₹{product.price}</span>
        {inCart ? (
          <QtyControl
            name={product.name}
            qty={inCart.qty}
            onPlus={() => addToCart(product)}
            onMinus={() => decreaseQty(product.id)}
          />
        ) : (
          <button className="btn-add" onClick={() => addToCart(product)} aria-label={`Add ${product.name}`}>
            Add
          </button>
        )}
      </div>
    </article>
  );
}