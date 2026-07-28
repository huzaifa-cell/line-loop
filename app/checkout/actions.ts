"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function createStorefrontOrder(data: any) {
  const supabase = createSupabaseAdminClient();

  try {
    // 1. Generate an order number
    // Format: LL-YYYY-MMDD-XXXX (where XXXX is random alphanumeric to avoid race conditions)
    const date = new Date();
    const year = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `LL-${year}-${mm}${dd}-${randomSuffix}`;

    // 2. Insert the main order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        guest_email: data.shippingAddress.email,
        status: 'pending',
        payment_method: data.paymentMethod === 'bank' ? 'bank_transfer' : data.paymentMethod,
        payment_status: data.paymentMethod === 'cod' ? 'cod_pending' : (data.paymentMethod === 'bank' ? 'bank_transfer_under_review' : 'pending'),
        subtotal: data.subtotal,
        shipping_amount: data.shippingCost,
        discount_amount: data.discountAmount || 0,
        total: data.grandTotal,
        shipping_address: data.shippingAddress,
        discount_code: data.discountCode || null
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error("Order Insert Error:", orderError);
      throw new Error(orderError?.message || "Failed to create order");
    }

    // 3. Process items and inventory
    for (const item of data.items) {
      // Find the matching variant to decrement stock
      let query = supabase
        .from('product_variants')
        .select('id, stock_quantity')
        .eq('product_id', item.product.id)
        .eq('size', item.selectedSize);

      if (item.selectedColor && item.selectedColor !== "Default") {
        query = query.eq('color', item.selectedColor);
      }
      
      const { data: variant, error: variantError } = await query.limit(1).maybeSingle();
      if (variantError) {
        console.error("Variant Query Error:", variantError, "for item:", item);
      }

      let variantId = null;
      let variantLabel = `${item.selectedSize}`;
      if (item.selectedColor && item.selectedColor !== "Default") {
         variantLabel += ` / ${item.selectedColor}`;
      }

      if (variant) {
        variantId = variant.id;
        // Decrement stock
        const { error: stockErr } = await supabase
          .from('product_variants')
          .update({ stock_quantity: variant.stock_quantity - item.quantity })
          .eq('id', variant.id);
        if (stockErr) console.error("Stock Update Error:", stockErr);

        // Log inventory deduction immediately for COD/Card. For Bank Transfer, 
        // the Admin panel processes the final log, but we deduct stock here to reserve it.
        const { error: invLogErr } = await supabase
          .from('inventory_log')
          .insert({
            variant_id: variant.id,
            change_amount: -item.quantity,
            reason: 'sale',
            order_id: order.id
          });
        if (invLogErr) console.error("Inventory Log Error:", invLogErr);
      }

      // Insert order item
      const { error: itemErr } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          variant_id: variantId,
          product_title: item.product.name,
          variant_label: variantLabel,
          unit_price: item.product.price,
          quantity: item.quantity
        });
      if (itemErr) console.error("Order Item Insert Error:", itemErr);
    }

    // Log initial status
    const { error: statusErr } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        status: 'pending',
        note: 'Order placed via storefront'
      });
    if (statusErr) console.error("Status History Insert Error:", statusErr);

    // Increment discount usage if a discount was applied
    if (data.discountId) {
      const { data: disc, error: discErr } = await supabase
        .from('discounts')
        .select('times_used')
        .eq('id', data.discountId)
        .maybeSingle();

      if (disc) {
        await supabase
          .from('discounts')
          .update({ times_used: (disc.times_used || 0) + 1 })
          .eq('id', data.discountId);
      } else if (discErr) {
        console.error("Discount Query Error:", discErr);
      }
    }

    // Send order confirmation email
    if (data.shippingAddress?.email) {
      await sendOrderConfirmationEmail(
        data.shippingAddress.email,
        orderNumber,
        data.shippingAddress.fullName,
        data.grandTotal,
        data.paymentMethod
      );
    }

    return { success: true, orderId: order.id, orderNumber };
  } catch (e: any) {
    console.error("createStorefrontOrder FATAL ERROR:", e);
    throw new Error("Failed to place order: " + e.message);
  }
}
