import { filterProducts } from "./filterProducts";
import { products } from "../data/products";

describe("filterProducts", () => {
  it("returns everything by default", () => {
    expect(filterProducts(products)).toHaveLength(products.length);
  });

  it("filters by category", () => {
    const result = filterProducts(products, { category: "Calculators" });
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.category === "Calculators")).toBe(true);
  });

  it("search ignores case and extra spaces", () => {
    const result = filterProducts(products, { search: "  CASIO " });
    expect(result.map((p) => p.id)).toContain(8);
    expect(result.map((p) => p.id)).toContain(9);
  });

  it("search also looks in the description", () => {
    const result = filterProducts(products, { search: "admit card" });
    expect(result.map((p) => p.name)).toContain("Transparent Document Folder");
  });

  it("combines category and search", () => {
    const result = filterProducts(products, { category: "Writing", search: "pen" });
    expect(result.every((p) => p.category === "Writing")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("sorts by price without changing the original list", () => {
    const firstIdBefore = products[0].id;
    const low = filterProducts(products, { sort: "low" });
    const high = filterProducts(products, { sort: "high" });

    expect(low[0].price).toBeLessThanOrEqual(low[1].price);
    expect(high[0].price).toBeGreaterThanOrEqual(high[1].price);
    expect(products[0].id).toBe(firstIdBefore);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterProducts(products, { search: "zzzz" })).toEqual([]);
  });
});