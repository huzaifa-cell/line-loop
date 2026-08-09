"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";

// ─── Zod Schemas ────────────────────────────────────────

const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+92|0)?3\d{9}$/,
      "Please enter a valid Pakistani phone number (e.g. 03001234567 or +923001234567)"
    ),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().default("Pakistan"),
});

const OrderItemSchema = z.object({
  product: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    image: z.string(),
    slug: z.string(),
    description: z.string(),
    originalPrice: z.number(),
    category: z.string(),
    status: z.string(),
    createdAt: z.string(),
  }),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  selectedSize: z.string().min(1, "Size is required"),
  selectedColor: z.string(),
});

const OrderDataSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Cart is empty"),
  shippingMethod: z.string(),
  paymentMethod: z.enum(["cod", "bank"]),
  discountCode: z.string(),
  discountAmount: z.number().min(0),
  discountId: z.string().nullable(),
  subtotal: z.number().positive(),
  shippingCost: z.number().min(0),
  grandTotal: z.number().positive(),
  shippingAddress: ShippingAddressSchema,
});

type OrderData = z.infer<typeof OrderDataSchema>;
type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Find the matching variant for an order item.
 */
async function findVariant(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  item: OrderItem
) {
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select("id, stock_quantity, color")
    .eq("product_id", item.product.id)
    .eq("size", item.selectedSize);

  if (error || !variants || variants.length === 0) return null;

  if (item.selectedColor && item.selectedColor !== "Default") {
    return (
      variants.find((v) => {
        if (v.color === item.selectedColor) return true;
        try {
          if (v.color?.startsWith("{")) {
            return JSON.parse(v.color).name === item.selectedColor;
          }
        } catch {
          /* ignore */
        }
        return false;
      }) ?? null
    );
  }

  return variants[0];
}

export async function createStorefrontOrder(rawData: unknown) {
  // ──────────────────────────────────────────────────
  // Phase 0: Validate input with Zod
  // ──────────────────────────────────────────────────
  const parseResult = OrderDataSchema.safeParse(rawData);
  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0];
    throw new Error(firstError?.message || "Invalid order data. Please check your form.");
  }
  const data = parseResult.data;

  const supabase = createSupabaseAdminClient();


  // ──────────────────────────────────────────────────
  // Phase 1: Validate stock for ALL items before creating anything
  // ──────────────────────────────────────────────────
  const resolvedVariants: { item: OrderItem; variant: { id: string; stock_quantity: number; color: string } | null; variantLabel: string }[] = [];

  for (const item of data.items) {
    const variant = await findVariant(supabase, item);

    let variantLabel = `${item.selectedSize}`;
    if (item.selectedColor && item.selectedColor !== "Default") {
      variantLabel += ` / ${item.selectedColor}`;
    }

    // Validate stock availability
    if (variant && variant.stock_quantity < item.quantity) {
      throw new Error(
        `Sorry, "${item.product.name}" (${variantLabel}) only has ${variant.stock_quantity} unit(s) in stock. Please adjust your quantity.`
      );
    }

    resolvedVariants.push({ item, variant, variantLabel });
  }

  // ──────────────────────────────────────────────────
  // Phase 2: Create order and atomically decrement stock
  // ──────────────────────────────────────────────────
  try {
    // Generate a collision-resistant order number using crypto
    const date = new Date();
    const year = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
    const orderNumber = `LL-${year}-${mm}${dd}-${randomSuffix}`;

    // Insert the main order record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        guest_email: data.shippingAddress.email,
        status: "pending",
        payment_method:
          data.paymentMethod === "bank" ? "bank_transfer" : data.paymentMethod,
        payment_status:
          data.paymentMethod === "cod"
            ? "cod_pending"
            : data.paymentMethod === "bank"
            ? "bank_transfer_under_review"
            : "pending",
        subtotal: data.subtotal,
        shipping_amount: data.shippingCost,
        discount_amount: data.discountAmount || 0,
        total: data.grandTotal,
        shipping_address: data.shippingAddress,
        discount_code: data.discountCode || null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order Insert Error:", orderError);
      throw new Error(orderError?.message || "Failed to create order");
    }

    // Process each item: atomic stock decrement + order item insert
    for (const { item, variant, variantLabel } of resolvedVariants) {
      let variantId: string | null = null;

      if (variant) {
        variantId = variant.id;

        // Atomic stock decrement via RPC — prevents race conditions
        const { data: decremented, error: rpcError } = await supabase.rpc(
          "decrement_stock",
          { p_variant_id: variant.id, p_quantity: item.quantity }
        );

        if (rpcError) {
          console.error("Stock RPC Error:", rpcError);
          // Fallback: conditional update if RPC isn't deployed yet
          const { data: updated, error: fallbackErr } = await supabase
            .from("product_variants")
            .update({ stock_quantity: variant.stock_quantity - item.quantity })
            .eq("id", variant.id)
            .gte("stock_quantity", item.quantity)
            .select("id");

          if (fallbackErr || !updated || updated.length === 0) {
            throw new Error(
              `"${item.product.name}" (${variantLabel}) is no longer available in the requested quantity. Please try again.`
            );
          }
        } else if (decremented === false) {
          throw new Error(
            `"${item.product.name}" (${variantLabel}) just went out of stock. Please try again.`
          );
        }

        // Log inventory deduction
        await supabase.from("inventory_log").insert({
          variant_id: variant.id,
          change_amount: -item.quantity,
          reason: "sale",
          order_id: order.id,
        });
      }

      // Insert order item
      await supabase.from("order_items").insert({
        order_id: order.id,
        variant_id: variantId,
        product_title: item.product.name,
        variant_label: variantLabel,
        unit_price: item.product.price,
        quantity: item.quantity,
      });
    }

    // Log initial status
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "pending",
      note: "Order placed via storefront",
    });

    // Increment discount usage if a discount was applied
    if (data.discountId) {
      const { data: disc } = await supabase
        .from("discounts")
        .select("times_used")
        .eq("id", data.discountId)
        .maybeSingle();

      if (disc) {
        await supabase
          .from("discounts")
          .update({ times_used: (disc.times_used || 0) + 1 })
          .eq("id", data.discountId);
      }
    }

    // Prepare email promises (using allSettled to ensure failure of one doesn't break the other)
    const emailPromises: Promise<unknown>[] = [
      sendNewOrderAdminNotification(
        orderNumber,
        data.shippingAddress.fullName || "Customer",
        data.grandTotal,
        data.paymentMethod
      ),
    ];

    if (data.paymentMethod === "cod" && data.shippingAddress?.email) {
      emailPromises.push(
        sendOrderConfirmationEmail(
          data.shippingAddress.email,
          orderNumber,
          data.shippingAddress.fullName,
          data.grandTotal,
          data.paymentMethod,
          false
        )
      );
    }

    // Await emails to prevent the serverless function from terminating prematurely
    await Promise.allSettled(emailPromises);

    return { success: true, orderId: order.id, orderNumber };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "An unexpected error occurred";
    console.error("createStorefrontOrder ERROR:", message);
    throw new Error(message);
  }
}
