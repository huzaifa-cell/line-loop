import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrderDetail } from "./actions";
import { OrderStatusManager, OrderNoteForm, STATUS_COLORS } from "./OrderDetailClient";

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) redirect('/admin/orders');

  const customerEmail = order.profiles?.email || order.guest_email;
  const customerName = order.profiles?.full_name || order.shipping_address?.fullName || 'Guest';
  const address = order.shipping_address as any;
  const statusHistory = (order.order_status_history || []).sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-ink-black pb-4">
        <div>
          <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2 text-ink-black/60">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">{order.order_number}</h1>
          <div className="text-sm text-ink-black/60 mt-1">
            Placed {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
        <span className={`border px-3 py-1 text-xs uppercase font-bold ${STATUS_COLORS[order.status] || 'border-ink-black text-ink-black'}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column — Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="border border-ink-black bg-ivory-mist">
            <div className="px-6 py-3 bg-warm-parchment border-b border-ink-black">
              <h2 className="text-xs font-bold uppercase tracking-widest">Order Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-ink-black/10 text-xs uppercase tracking-widest text-ink-black/60">
                <tr>
                  <th className="px-6 py-3 text-left font-bold">Product</th>
                  <th className="px-6 py-3 text-left font-bold">Variant</th>
                  <th className="px-6 py-3 text-center font-bold">Qty</th>
                  <th className="px-6 py-3 text-right font-bold">Price</th>
                  <th className="px-6 py-3 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-black/10">
                {order.order_items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 font-medium">{item.product_title}</td>
                    <td className="px-6 py-3 text-ink-black/70">{item.variant_label || '—'}</td>
                    <td className="px-6 py-3 text-center">{item.quantity}</td>
                    <td className="px-6 py-3 text-right">Rs {Number(item.unit_price).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-bold">Rs {(Number(item.unit_price) * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-ink-black">
                <tr>
                  <td colSpan={4} className="px-6 py-2 text-right text-xs uppercase tracking-widest text-ink-black/60">Subtotal</td>
                  <td className="px-6 py-2 text-right">Rs {Number(order.subtotal).toLocaleString()}</td>
                </tr>
                {Number(order.discount_amount) > 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-2 text-right text-xs uppercase tracking-widest text-ink-black/60">
                      Discount {order.discount_code && <span>({order.discount_code})</span>}
                    </td>
                    <td className="px-6 py-2 text-right text-green-700">-Rs {Number(order.discount_amount).toLocaleString()}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-6 py-2 text-right text-xs uppercase tracking-widest text-ink-black/60">Shipping</td>
                  <td className="px-6 py-2 text-right">Rs {Number(order.shipping_amount).toLocaleString()}</td>
                </tr>
                <tr className="font-bold text-base">
                  <td colSpan={4} className="px-6 py-3 text-right text-xs uppercase tracking-widest">Total</td>
                  <td className="px-6 py-3 text-right">Rs {Number(order.total).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status History Timeline */}
          <div className="border border-ink-black bg-ivory-mist">
            <div className="px-6 py-3 bg-warm-parchment border-b border-ink-black">
              <h2 className="text-xs font-bold uppercase tracking-widest">Status History</h2>
            </div>
            <div className="p-6">
              {statusHistory.length === 0 ? (
                <div className="text-sm text-ink-black/60">No status history recorded.</div>
              ) : (
                <div className="space-y-4">
                  {statusHistory.map((entry: any, i: number) => (
                    <div key={entry.id} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-ink-black' : 'bg-ink-black/30'}`} />
                        {i < statusHistory.length - 1 && <div className="w-px h-8 bg-ink-black/20" />}
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${STATUS_COLORS[entry.status] || 'border-ink-black text-ink-black'}`}>
                            {entry.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-ink-black/50">
                            {new Date(entry.created_at).toLocaleString()}
                          </span>
                        </div>
                        {entry.note && <p className="text-sm text-ink-black/70 mt-1">{entry.note}</p>}
                        {entry.profiles && (
                          <p className="text-xs text-ink-black/40 mt-0.5">by {entry.profiles.full_name || entry.profiles.email}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="border border-ink-black bg-ivory-mist">
            <div className="px-6 py-3 bg-warm-parchment border-b border-ink-black">
              <h2 className="text-xs font-bold uppercase tracking-widest">Internal Notes</h2>
            </div>
            <div className="p-6 space-y-4">
              {order.notes && (
                <pre className="text-sm text-ink-black/70 whitespace-pre-wrap font-body-md">{order.notes}</pre>
              )}
              <OrderNoteForm orderId={id} />
            </div>
          </div>
        </div>

        {/* Right Column — Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="border border-ink-black bg-ivory-mist p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Update Status</h3>
            <OrderStatusManager orderId={id} currentStatus={order.status} />
          </div>

          {/* Customer Info */}
          <div className="border border-ink-black bg-ivory-mist p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Customer</h3>
            <div className="space-y-2 text-sm">
              <div className="font-bold">{customerName}</div>
              <div className="text-ink-black/70">{customerEmail}</div>
              {address?.phone && <div className="text-ink-black/70">{address.phone}</div>}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border border-ink-black bg-ivory-mist p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Shipping Address</h3>
            {address ? (
              <div className="text-sm space-y-1 text-ink-black/80">
                <div>{address.fullName}</div>
                <div>{address.address}</div>
                {address.apartment && <div>{address.apartment}</div>}
                <div>{address.city}{address.state ? `, ${address.state}` : ''}</div>
                <div>{address.postalCode}</div>
                <div>{address.country}</div>
                {address.phone && <div className="mt-2">{address.phone}</div>}
              </div>
            ) : (
              <div className="text-sm text-ink-black/60">No address on file</div>
            )}
          </div>

          {/* Payment Info */}
          <div className="border border-ink-black bg-ivory-mist p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Payment</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-ink-black/60">Method: </span>
                <span className="font-bold uppercase">{order.payment_method.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-ink-black/60">Status: </span>
                <span className="font-bold uppercase">{order.payment_status.replace(/_/g, ' ')}</span>
              </div>
              {order.card_brand && (
                <div>
                  <span className="text-ink-black/60">Card: </span>
                  <span>{order.card_brand} ····{order.card_last4}</span>
                </div>
              )}
              {order.bank_transfer_reference && (
                <div>
                  <span className="text-ink-black/60">Ref: </span>
                  <span>{order.bank_transfer_reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
