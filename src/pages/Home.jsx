
import { useEffect, useState } from "react";
import { filterProducts } from "../utils/filterProducts";
import ProductCard from "../components/ProductCard";
import CategoryBar from "../components/CategoryBar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Product API error:", error);
        setError("Unable to load products. Please try again.");
        setLoading(false);
      });
  }, []);

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

      {loading ? (
        <p className="empty-note">Loading products...</p>
      ) : error ? (
        <p className="empty-note">{error}</p>
      ) : visible.length === 0 ? (
        <p className="empty-note">
          Nothing matches "{search}". Try a shorter word or pick another category.
        </p>
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
