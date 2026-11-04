export function validateCheckout(form) {
  const errors = {};

  if (form.name.trim().length < 3) {
    errors.name = "Enter your full name (at least 3 letters)";
  }

  // Indian mobile numbers: 10 digits, starting with 6 to 9
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10 digit mobile number";
  }

  if (form.address.trim().length < 10) {
    errors.address = "Enter your full address (hostel/flat, street, area)";
  }

  if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Pincode should be 6 digits";
  }

  return errors;
}