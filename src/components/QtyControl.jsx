export default function QtyControl({ name, qty, onPlus, onMinus }) {
  return (
    <div className="qty">
      <button onClick={onMinus} aria-label={`Decrease ${name}`}>-</button>
      <span aria-label={`${name} quantity`}>{qty}</span>
      <button onClick={onPlus} aria-label={`Increase ${name}`}>+</button>
    </div>
  );
}
