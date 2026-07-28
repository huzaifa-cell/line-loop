"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getOrderDetail(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles!orders_profile_id_fkey ( email, full_name ),
      order_items (
        id,
        product_title,
        variant_label,
        unit_price,
        quantity,
        variant_id
      ),
      order_status_history (
        id,
        status,
        note,
        created_at,
        profiles ( full_name, email )
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: newStatus,
      changed_by: profile?.id,
      note: note || null,
    });
    
  await supabase
    .from('activity_log')
    .insert({
      actor_id: profile?.id,
      action: 'order.status_change',
      entity_type: 'orders',
      entity_id: orderId,
      metadata: { new_status: newStatus, note },
    });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function addOrderNote(orderId: string, note: string) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  // Append note to order
  const { data: order } = await supabase
    .from('orders')
    .select('notes')
    .eq('id', orderId)
    .single();

  const existing = order?.notes || '';
  const timestamp = new Date().toISOString();
  const newNotes = `${existing}\n[${timestamp}] ${note}`.trim();

  await supabase
    .from('orders')
    .update({ notes: newNotes, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  await supabase
    .from('activity_log')
    .insert({
      actor_id: profile?.id,
      action: 'order.note_added',
      entity_type: 'orders',
      entity_id: orderId,
      metadata: { note },
    });

  revalidatePath(`/admin/orders/${orderId}`);
}
