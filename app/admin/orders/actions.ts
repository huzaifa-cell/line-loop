"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAdminOrders() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      guest_email,
      status,
      payment_method,
      payment_status,
      total,
      created_at,
      profiles ( email )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }
  
  return data;
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
  
  // Log status change
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', (await auth()).userId)
    .single();

  await supabase
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: newStatus,
      changed_by: profile?.id
    });
    
  await supabase
    .from('activity_log')
    .insert({
      actor_id: profile?.id,
      action: 'order.status_change',
      entity_type: 'orders',
      entity_id: orderId,
      metadata: { new_status: newStatus }
    });

  revalidatePath("/admin/orders");
}
