"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export async function getCustomers(search?: string) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from('profiles')
    .select('id, clerk_user_id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (search && search.trim()) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: profiles, error } = await query.limit(100);
  if (error || !profiles) return [];

  // For each customer, get their order stats
  const result = [];
  for (const profile of profiles) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('total, status')
      .eq('profile_id', profile.id);

    const orders = orderData || [];
    const totalSpent = orders
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, o: any) => sum + Number(o.total), 0);

    result.push({
      ...profile,
      orderCount: orders.length,
      totalSpent,
    });
  }

  return result;
}

export async function getCustomerOrders(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_method, total, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}
