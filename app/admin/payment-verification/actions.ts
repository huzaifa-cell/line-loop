"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getPendingBankTransfers() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      guest_email,
      total,
      bank_transfer_amount_due,
      bank_transfer_reference,
      bank_transfer_screenshot_path,
      bank_transfer_screenshot_hash,
      payment_hold_expires_at,
      profiles ( email )
    `)
    .eq('payment_method', 'bank_transfer')
    .eq('payment_status', 'bank_transfer_under_review')
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }
  
  return data;
}

export async function processBankTransfer(orderId: string, action: 'approve' | 'reject') {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', (await auth()).userId)
    .single();

  const paymentStatus = action === 'approve' ? 'bank_transfer_verified' : 'bank_transfer_rejected';
  const orderStatus = action === 'approve' ? 'confirmed' : 'pending';

  const { error } = await supabase
    .from('orders')
    .update({ 
      payment_status: paymentStatus, 
      status: orderStatus,
      verified_by: profile?.id,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
  
  // Log activity
  await supabase
    .from('activity_log')
    .insert({
      actor_id: profile?.id,
      action: `bank_transfer.${action}`,
      entity_type: 'orders',
      entity_id: orderId,
      metadata: { payment_status: paymentStatus }
    });
    
  if (action === 'approve') {
    // If approved, decrement the final stock via inventory log.
    // Assuming the checkout process only put a hold.
    // Fetch order items to log stock reduction
    const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (items) {
      for (const item of items) {
        if (item.variant_id) {
          await supabase.from('inventory_log').insert({
            variant_id: item.variant_id,
            change_amount: -item.quantity,
            reason: 'sale',
            changed_by: profile?.id,
            order_id: orderId
          });
        }
      }
    }
  }

  revalidatePath("/admin/payment-verification");
  revalidatePath("/admin/orders");
}
