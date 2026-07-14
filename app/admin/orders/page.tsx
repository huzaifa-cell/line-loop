import Link from "next/link";
import { getAdminOrders, updateOrderStatus } from "./actions";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
      </div>

      <div className="bg-ivory-mist border border-ink-black">
        <table className="w-full text-left text-sm">
          <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Order Number</th>
              <th className="px-6 py-4 font-bold">Customer</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Payment</th>
              <th className="px-6 py-4 font-bold">Total</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-black/20">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-ink-black/60">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => {
                const customerEmail = order.profiles?.email || order.guest_email;
                return (
                  <tr key={order.id} className="hover:bg-warm-parchment/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{order.order_number}</td>
                    <td className="px-6 py-4">{customerEmail}</td>
                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className={`border px-2 py-0.5 text-[10px] uppercase font-bold inline-block
                        ${order.status === 'pending' ? 'border-ink-black text-ink-black' : 
                          order.status === 'delivered' ? 'border-green-800 text-green-800' : 
                          order.status === 'cancelled' ? 'border-thread-red text-thread-red' : 
                          'border-ink-black/60 text-ink-black/80'}`}>
                        {order.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{order.payment_method.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-ink-black/60">
                        {order.payment_status.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">Rs {order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
