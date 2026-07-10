/**
 * Discount code validation — pure function, no server-only code.
 * Separated from lib/orders.ts so it can be imported by client components
 * (checkout) without triggering the "use server" boundary.
 */

const DISCOUNT_CODES: Record<
  string,
  { type: "PERCENT" | "FLAT"; value: number; label: string }
> = {
  WELCOME10: { type: "PERCENT", value: 10, label: "Welcome 10% off" },
  FLAT500: { type: "FLAT", value: 500, label: "Rs 500 off" },
};

export function validateDiscountCode(
  code: string,
  subtotal: number
): { valid: boolean; discount: number; label?: string } {
  const entry = DISCOUNT_CODES[code.toUpperCase().trim()];
  if (!entry) return { valid: false, discount: 0 };
  const discount =
    entry.type === "PERCENT"
      ? Math.round((subtotal * entry.value) / 100)
      : entry.value;
  return { valid: true, discount, label: entry.label };
}
