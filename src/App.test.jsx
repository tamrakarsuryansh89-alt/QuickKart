import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./test/renderApp";
import { products } from "./data/products";

describe("Home page", () => {
  it("shows every product at first", () => {
    renderApp();
    expect(screen.getAllByRole("article")).toHaveLength(products.length);
  });

  it("category chip filters the list", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Calculators" }));
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("search narrows results and shows a message when empty", async () => {
    const user = userEvent.setup();
    renderApp();
    const box = screen.getByLabelText("Search products");

    await user.type(box, "compass");
    expect(screen.getAllByRole("article").length).toBeGreaterThan(0);

    await user.clear(box);
    await user.type(box, "pizza");
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText(/nothing matches/i)).toBeInTheDocument();
  });

  it("sorting low to high puts the cheapest first", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.selectOptions(screen.getByLabelText("Sort by price"), "low");
    const first = screen.getAllByRole("article")[0];
    expect(within(first).getByText("Steel Ruler 30cm")).toBeInTheDocument();
  });

  it("adding a product updates the navbar count", async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByRole("link", { name: /cart \(0\)/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add Steel Ruler 30cm" }));
    await user.click(screen.getByRole("button", { name: "Increase Steel Ruler 30cm" }));

    expect(screen.getByRole("link", { name: /cart \(2\)/i })).toBeInTheDocument();
  });
});

describe("Cart page", () => {
  it("shows an empty message when nothing is added", () => {
    renderApp("/cart");
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("small order pays delivery fee and shows the free-delivery nudge", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Add Steel Ruler 30cm" })); // 25
    await user.click(screen.getByRole("link", { name: /cart/i }));

    expect(screen.getByText(/add ₹175 more for free delivery/i)).toBeInTheDocument();
    expect(screen.getByText("₹50")).toBeInTheDocument(); // 25 + 25 fee as total
  });

  it("big order gets free delivery", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Add Casio fx-82MS" }));
    await user.click(screen.getByRole("link", { name: /cart/i }));

    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.queryByText(/more for free delivery/i)).not.toBeInTheDocument();
  });

  it("remove button clears the row and shows the empty page", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole("button", { name: "Add Steel Ruler 30cm" }));
    await user.click(screen.getByRole("link", { name: /cart/i }));
    await user.click(screen.getByRole("button", { name: "Remove Steel Ruler 30cm" }));

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("cart survives a page reload (localStorage)", async () => {
    const user = userEvent.setup();
    const first = renderApp();
    await user.click(screen.getByRole("button", { name: "Add Steel Ruler 30cm" }));
    first.unmount();

    renderApp();
    expect(screen.getByRole("link", { name: /cart \(1\)/i })).toBeInTheDocument();
  });
});

describe("Checkout flow", () => {
  async function fillCartAndOpenCheckout(user) {
    await user.click(screen.getByRole("button", { name: "Add Casio fx-82MS" }));
    await user.click(screen.getByRole("link", { name: /cart/i }));
    await user.click(screen.getByRole("link", { name: /go to checkout/i }));
  }

  it("redirects an empty cart away from checkout", () => {
    renderApp("/checkout");
    expect(screen.getByText(/nothing to checkout/i)).toBeInTheDocument();
  });

  it("shows errors and stays on the page when the form is empty", async () => {
    const user = userEvent.setup();
    renderApp();
    await fillCartAndOpenCheckout(user);
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(screen.getAllByRole("alert")).toHaveLength(4);
    expect(screen.getByRole("heading", { name: /delivery details/i })).toBeInTheDocument();
  });

  it("places the order, shows the success page and empties the cart", async () => {
    const user = userEvent.setup();
    renderApp();
    await fillCartAndOpenCheckout(user);

    await user.type(screen.getByLabelText("Full name"), "Surya Patel");
    await user.type(screen.getByLabelText("Mobile number"), "9876543210");
    await user.type(screen.getByLabelText("Address"), "Room 12, Hostel B, Vijay Nagar");
    await user.type(screen.getByLabelText("Pincode"), "452010");
    await user.click(screen.getByRole("button", { name: /place order/i }));

    expect(screen.getByRole("heading", { name: /order placed, surya patel/i })).toBeInTheDocument();
    expect(screen.getByText(/keep ₹650 ready/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cart \(0\)/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("quickkart-cart"))).toEqual([]);
  });
});

describe("Success page", () => {
  it("handles opening /success directly", () => {
    renderApp("/success");
    expect(screen.getByText(/no recent order/i)).toBeInTheDocument();
  });
});
