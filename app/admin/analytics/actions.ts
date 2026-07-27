"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export async function getAnalyticsData() {
  const supabase = await createSupabaseServerClient();
  
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  
  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // All orders (non-cancelled)
  const { data: allOrders } = await supabase
    .from('orders')
    .select('id, total, status, payment_method, created_at')
    .not('status', 'eq', 'cancelled');
  
  const orders = allOrders || [];
  
  // Revenue calculations
  const todayRevenue = orders.filter(o => new Date(o.created_at) >= todayStart).reduce((s, o) => s + Number(o.total), 0);
  const weekRevenue = orders.filter(o => new Date(o.created_at) >= weekStart).reduce((s, o) => s + Number(o.total), 0);
  const monthRevenue = orders.filter(o => new Date(o.created_at) >= monthStart).reduce((s, o) => s + Number(o.total), 0);
  const allTimeRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(allTimeRevenue / orders.length) : 0;

  // Orders by status
  const { data: allOrdersWithStatus } = await supabase
    .from('orders')
    .select('status');
  
  const statusCounts: Record<string, number> = {};
  (allOrdersWithStatus || []).forEach((o: any) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  // Payment method distribution
  const paymentCounts: Record<string, number> = {};
  orders.forEach(o => {
    const method = o.payment_method.replace('_', ' ');
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });

  // Orders per day (last 30 days)
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyData: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => o.created_at.startsWith(dateStr));
    dailyData.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    });
  }

  // Top selling products
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_title, quantity, unit_price');
  
  const productSales: Record<string, { qty: number; revenue: number }> = {};
  (orderItems || []).forEach((item: any) => {
    if (!productSales[item.product_title]) {
      productSales[item.product_title] = { qty: 0, revenue: 0 };
    }
    productSales[item.product_title].qty += item.quantity;
    productSales[item.product_title].revenue += Number(item.unit_price) * item.quantity;
  });

  const topProducts = Object.entries(productSales)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    todayRevenue,
    weekRevenue,
    monthRevenue,
    allTimeRevenue,
    totalOrders: (allOrdersWithStatus || []).length,
    avgOrderValue,
    statusCounts,
    paymentCounts,
    dailyData,
    topProducts,
  };
}
