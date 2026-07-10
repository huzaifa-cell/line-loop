/**
 * Client-side card validation — Luhn checksum, expiry check, and masked
 * formatting. No external libraries. Hand-built to match the design system.
 *
 * IMPORTANT: This is a PLACEHOLDER for a future payment gateway. The card form
 * validates client-side, stores only last-4 / brand / expiry, and is honest
 * about "processed by our team" — it is NOT PCI-compliant if expanded.
 */

/** Luhn checksum — returns true for valid card numbers. */
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

/** Format a card number with spaces every 4 digits, max 19 digits. */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** Format an expiry string as MM/YY. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Extract the last 4 digits from a card number string. */
export function getLast4(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  return digits.slice(-4);
}

/** Detect card brand from the first digits. */
export function detectBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  if (/^(50|56|57|58|63|67)/.test(digits)) return "Maestro";
  return "Card";
}

/** Validate expiry — must be in the future (MM/YY). */
export function validateExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiryDate = new Date(year, month, 0, 23, 59, 59);
  return expiryDate > now;
}

/** Validate CVV — 3 or 4 digits. */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/** Validate cardholder name — non-empty, letters/spaces only. */
export function validateCardholder(name: string): boolean {
  return name.trim().length >= 2 && /^[a-zA-Z\s.'-]+$/.test(name.trim());
}

export interface CardValidationResult {
  isValid: boolean;
  errors: Partial<Record<"cardholder" | "number" | "expiry" | "cvv", string>>;
}

/** Validate the full card form. Returns errors per field. */
export function validateCardForm(input: {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}): CardValidationResult {
  const errors: CardValidationResult["errors"] = {};

  if (!validateCardholder(input.cardholderName)) {
    errors.cardholder = "Enter the cardholder name";
  }
  if (!luhnCheck(input.cardNumber)) {
    errors.number = "Enter a valid card number";
  }
  if (!validateExpiry(input.expiry)) {
    errors.expiry = "Enter a valid future date (MM/YY)";
  }
  if (!validateCVV(input.cvv)) {
    errors.cvv = "3–4 digits";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
