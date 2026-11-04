import { validateCheckout } from "./validate";

const good = {
  name: "Surya Patel",
  phone: "9876543210",
  address: "Room 12, Hostel B, Vijay Nagar",
  pincode: "452010",
};

describe("validateCheckout", () => {
  it("passes a correct form", () => {
    expect(validateCheckout(good)).toEqual({});
  });

  it("flags every empty field", () => {
    const errors = validateCheckout({ name: "", phone: "", address: "", pincode: "" });
    expect(Object.keys(errors).sort()).toEqual(["address", "name", "phone", "pincode"]);
  });

  it("rejects phone numbers that are short or start below 6", () => {
    expect(validateCheckout({ ...good, phone: "98765" }).phone).toBeDefined();
    expect(validateCheckout({ ...good, phone: "1234567890" }).phone).toBeDefined();
  });

  it("rejects letters in phone and pincode", () => {
    expect(validateCheckout({ ...good, phone: "98765abcde" }).phone).toBeDefined();
    expect(validateCheckout({ ...good, pincode: "45ab10" }).pincode).toBeDefined();
  });

  it("needs a 6 digit pincode", () => {
    expect(validateCheckout({ ...good, pincode: "4520" }).pincode).toBeDefined();
  });

  it("ignores spaces around values", () => {
    expect(validateCheckout({ ...good, name: "  Surya  ", phone: " 9876543210 " })).toEqual({});
  });
});