"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export async function getDashboardStats() {
  const supabase = await createSupabaseServerClient();
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Today's orders count
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString());

  // Pending bank transfers
  const { count: pendingTransfers } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('payment_method', 'bank_transfer')
    .eq('payment_status', 'bank_transfer_under_review');

  // Low stock alerts
  const { count: lowStockAlerts } = await supabase
    .from('product_variants')
    .select('*, products!inner(is_published)', { count: 'exact', head: true })
    .eq('products.is_published', true)
    .lte('stock_quantity', 5); // using default threshold

  // Today's revenue
  const { data: todayRevenueData } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', todayStart.toISOString())
    .not('status', 'eq', 'cancelled');
  const todayRevenue = todayRevenueData?.reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0;

  // This week's revenue
  const { data: weekRevenueData } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', weekStart.toISOString())
    .not('status', 'eq', 'cancelled');
  const weekRevenue = weekRevenueData?.reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0;

  // This month's revenue
  const { data: monthRevenueData } = await supabase
    .from('orders')
    .select('total')
    .gte('created_at', monthStart.toISOString())
    .not('status', 'eq', 'cancelled');
  const monthRevenue = monthRevenueData?.reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0;

  // Total orders count
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  return {
    todayOrders: todayOrders || 0,
    pendingTransfers: pendingTransfers || 0,
    lowStockAlerts: lowStockAlerts || 0,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalOrders: totalOrders || 0,
  };
}

export async function getRecentOrders(limit = 5) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      guest_email,
      status,
      payment_method,
      total,
      created_at,
      profiles!orders_profile_id_fkey ( email )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

export async function getRecentActivity(limit = 5) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}
