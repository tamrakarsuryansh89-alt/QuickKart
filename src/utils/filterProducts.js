export function filterProducts(products, { category = "All", search = "", sort = "default" } = {}) {
  const text = search.trim().toLowerCase();

  const result = products.filter((p) => {
    const sameCategory = category === "All" || p.category === category;
    const matchesText =
      text === "" ||
      p.name.toLowerCase().includes(text) ||
      p.desc.toLowerCase().includes(text);
    return sameCategory && matchesText;
  });

  // copy first so we never change the original array
  if (sort === "low") return [...result].sort((a, b) => a.price - b.price);
  if (sort === "high") return [...result].sort((a, b) => b.price - a.price);
  return result;
}