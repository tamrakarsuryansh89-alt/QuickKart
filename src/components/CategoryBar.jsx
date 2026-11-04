import { categories } from "../data/products";

export default function CategoryBar({ active, onChange }) {
  return (
    <div className="categories" role="group" aria-label="Categories">
      {categories.map((cat) => (
        <button
          key={cat}
          className={cat === active ? "chip active" : "chip"}
          aria-pressed={cat === active}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
