import { useState } from "react";
import { products } from "../data/products";
import { filterProducts } from "../utils/filterProducts";
import ProductCard from "../components/ProductCard";
import CategoryBar from "../components/CategoryBar";

export default function Home() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const visible = filterProducts(products, { category, search, sort });

  return (
    <main className="container">
      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search pens, calculator, compass..."
          aria-label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="sort"
          aria-label="Sort by price"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Sort: Featured</option>
          <option value="low">Price: Low to high</option>
          <option value="high">Price: High to low</option>
        </select>
      </div>

      <CategoryBar active={category} onChange={setCategory} />

      {visible.length === 0 ? (
        <p className="empty-note">Nothing matches "{search}". Try a shorter word or pick another category.</p>
      ) : (
        <section className="grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </section>
      )}
    </main>
  );
}
