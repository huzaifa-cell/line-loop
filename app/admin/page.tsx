import Link from "next/link";
import { getDashboardStats, getRecentOrders, getRecentActivity } from "./actions";

function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    "order.status_change": "Updated order status",
    "bank_transfer.approve": "Approved bank transfer",
    "bank_transfer.reject": "Rejected bank transfer",
    "product.create": "Created product",
    "product.update": "Updated product",
    "product.delete": "Deleted product",
    "discount.create": "Created discount code",
    "discount.update": "Updated discount code",
    "discount.delete": "Deleted discount code",
    "review.approve": "Approved review",
    "review.reject": "Rejected review",
    "banner.update": "Updated banner",
    "settings.update": "Updated settings",
  };
  return labels[action] || action.replace(/[._]/g, ' ');
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getRecentActivity(5),
  ]);

  return (
    <div className="max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/orders" className="border border-ink-black bg-ivory-mist p-6 hover:bg-warm-parchment transition-colors">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Today&apos;s Orders</div>
          <div className="text-3xl font-normal font-display-lg">{stats.todayOrders}</div>
        </Link>
        <Link href="/admin/payment-verification" className="border border-ink-black bg-ivory-mist p-6 hover:bg-warm-parchment transition-colors">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Pending Bank Transfers</div>
          <div className={`text-3xl font-normal font-display-lg ${stats.pendingTransfers > 0 ? 'text-thread-red' : ''}`}>{stats.pendingTransfers}</div>
        </Link>
        <Link href="/admin/inventory" className="border border-ink-black bg-ivory-mist p-6 hover:bg-warm-parchment transition-colors">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Low Stock Alerts</div>
          <div className={`text-3xl font-normal font-display-lg ${stats.lowStockAlerts > 0 ? 'text-thread-red' : ''}`}>{stats.lowStockAlerts}</div>
        </Link>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-ink-black bg-ivory-mist p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Today&apos;s Revenue</div>
          <div className="text-2xl font-normal font-display-lg">Rs {stats.todayRevenue.toLocaleString()}</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">This Week</div>
          <div className="text-2xl font-normal font-display-lg">Rs {stats.weekRevenue.toLocaleString()}</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">This Month</div>
          <div className="text-2xl font-normal font-display-lg">Rs {stats.monthRevenue.toLocaleString()}</div>
        </div>
      </div>
      
      {/* Recent Orders & Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink-black pb-2">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2">View All →</Link>
          </div>
          <div className="border border-ink-black bg-ivory-mist">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-black/60">
                No recent orders found.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 font-bold">Order</th>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-black/10">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-warm-parchment/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-bold hover:underline underline-offset-2">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-black/70">{order.profiles?.email || order.guest_email}</td>
                      <td className="px-4 py-3">
                        <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold inline-block
                          ${order.status === 'delivered' ? 'border-green-800 text-green-800' : 
                            order.status === 'cancelled' ? 'border-thread-red text-thread-red' : 
                            'border-ink-black/60 text-ink-black/80'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">Rs {Number(order.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink-black pb-2">Recent Activity</h2>
            <Link href="/admin/activity-log" className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2">View All →</Link>
          </div>
          <div className="border border-ink-black bg-ivory-mist">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-black/60">
                No recent activity found.
              </div>
            ) : (
              <div className="divide-y divide-ink-black/10">
                {recentActivity.map((entry: any) => (
                  <div key={entry.id} className="px-4 py-3">
                    <div className="text-sm font-medium">{formatActionLabel(entry.action)}</div>
                    <div className="text-xs text-ink-black/60 mt-0.5">
                      {entry.profiles?.full_name || entry.profiles?.email || 'System'} · {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
