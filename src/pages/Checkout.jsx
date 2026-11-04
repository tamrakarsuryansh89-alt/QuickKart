import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { validateCheckout } from "../utils/validate";

const emptyForm = { name: "", phone: "", address: "", pincode: "" };

export default function Checkout() {
  const { cart, totalItems, grandTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  if (cart.length === 0) {
    return (
      <main className="container empty-page">
        <h2>Nothing to checkout</h2>
        <p>Your cart is empty right now.</p>
        <Link to="/" className="btn-primary">Browse products</Link>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const found = validateCheckout(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const order = {
      id: "QK" + Date.now().toString().slice(-6),
      customer: form.name.trim(),
      total: grandTotal,
      itemCount: totalItems,
    };

    clearCart();
    navigate("/success", { state: { order } });
  };

  return (
    <main className="container narrow">
      <h2>Delivery details</h2>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" name="name" value={form.name} error={errors.name} onChange={handleChange} />
        <Field label="Mobile number" name="phone" value={form.phone} error={errors.phone} onChange={handleChange} inputMode="numeric" maxLength={10} />
        <Field label="Address" name="address" value={form.address} error={errors.address} onChange={handleChange} multiline />
        <Field label="Pincode" name="pincode" value={form.pincode} error={errors.pincode} onChange={handleChange} inputMode="numeric" maxLength={6} />

        <p className="pay-note">Pay ₹{grandTotal} in cash or UPI when your order arrives.</p>
        <button type="submit" className="btn-primary wide">Place order</button>
      </form>
    </main>
  );
}

function Field({ label, name, error, multiline, ...rest }) {
  const id = `field-${name}`;
  const Tag = multiline ? "textarea" : "input";

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} name={name} aria-invalid={Boolean(error)} {...rest} />
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
