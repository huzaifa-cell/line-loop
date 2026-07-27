"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { DiscountResult } from "@/lib/discount";

/**
 * Validates a discount code against the Supabase `discounts` table.
 * Checks: is_active, date range, usage limit, minimum order value.
 */
export async function validateDiscount(
  code: string,
  subtotal: number
): Promise<DiscountResult> {
  if (!code || !code.trim()) {
    return { valid: false, discount: 0, error: "Enter a discount code" };
  }

  const supabase = createSupabaseAdminClient();

  const { data: discount, error } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (error || !discount) {
    return { valid: false, discount: 0, error: "Invalid discount code" };
  }

  // Check date range
  const now = new Date();
  if (discount.starts_at && new Date(discount.starts_at) > now) {
    return { valid: false, discount: 0, error: "This code is not yet active" };
  }
  if (discount.expires_at && new Date(discount.expires_at) < now) {
    return { valid: false, discount: 0, error: "This code has expired" };
  }

  // Check usage limit
  if (
    discount.usage_limit !== null &&
    discount.times_used >= discount.usage_limit
  ) {
    return {
      valid: false,
      discount: 0,
      error: "This code has reached its usage limit",
    };
  }

  // Check minimum order value
  if (discount.min_order_value && subtotal < Number(discount.min_order_value)) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order of Rs ${Number(discount.min_order_value).toLocaleString()} required`,
    };
  }

  // Calculate discount amount
  const discountAmount =
    discount.type === "percentage"
      ? Math.round((subtotal * Number(discount.value)) / 100)
      : Number(discount.value);

  const label =
    discount.type === "percentage"
      ? `${Number(discount.value)}% off`
      : `Rs ${Number(discount.value).toLocaleString()} off`;

  return {
    valid: true,
    discount: Math.min(discountAmount, subtotal), // Never exceed subtotal
    discountId: discount.id,
    label,
  };
}
