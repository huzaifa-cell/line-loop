/**
 * Discount types shared between client (checkout UI) and server (validation action).
 * Actual validation logic lives in app/checkout/discount-actions.ts (server action).
 */

export interface DiscountResult {
  valid: boolean;
  discount: number;
  discountId?: string;
  label?: string;
  error?: string;
}
