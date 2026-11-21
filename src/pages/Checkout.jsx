
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { validateCheckout } from "../utils/validate";

const emptyForm = {
  name: "",
  phone: "",
  address: "",
  pincode: "",
};

export default function Checkout() {
  const { cart, grandTotal, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  if (cart.length === 0) {
    return (
      <main className="container empty-page">
        <h2>Nothing to checkout</h2>
        <p>Your cart is empty right now.</p>
        <Link to="/" className="btn-primary">
          Browse products
        </Link>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validateCheckout(form);
    setErrors(found);
    setApiError("");

    if (Object.keys(found).length > 0) return;

    if (!token) {
      setApiError("Please login before placing your order.");
      return;
    }

    const payload = {
      customer: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      pincode: form.pincode.trim(),
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.qty,
      })),
    };

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:8080/api/v1/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();

      let savedOrder;
      try {
        savedOrder = JSON.parse(responseText);
      } catch {
        savedOrder = responseText;
      }

      if (!response.ok) {
        throw new Error(
          typeof savedOrder === "string"
            ? savedOrder
            : savedOrder.message || "Unable to place order"
        );
      }

      clearCart();

      navigate("/success", {
        state: { order: savedOrder },
      });
    } catch (error) {
      setApiError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container narrow">
      <h2>Delivery details</h2>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <Field
          label="Full name"
          name="name"
          value={form.name}
          error={errors.name}
          onChange={handleChange}
        />

        <Field
          label="Mobile number"
          name="phone"
          value={form.phone}
          error={errors.phone}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={10}
        />

        <Field
          label="Address"
          name="address"
          value={form.address}
          error={errors.address}
          onChange={handleChange}
          multiline
        />

        <Field
          label="Pincode"
          name="pincode"
          value={form.pincode}
          error={errors.pincode}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={6}
        />

        <p className="pay-note">
          Pay ₹{grandTotal} in cash or UPI when your order arrives.
        </p>

        {apiError && (
          <p className="error" role="alert">
            {apiError}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary wide"
          disabled={submitting}
        >
          {submitting ? "Placing order..." : "Place order"}
        </button>
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
      <Tag
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
