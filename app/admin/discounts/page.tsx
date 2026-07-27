import { getDiscounts, toggleDiscountStatus, deleteDiscount } from "./actions";
import { CreateDiscountForm } from "./DiscountForm";

export default async function AdminDiscountsPage() {
  const discounts = await getDiscounts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
        <CreateDiscountForm />
      </div>

      <div className="bg-ivory-mist border border-ink-black">
        <table className="w-full text-left text-sm">
          <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Code</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Value</th>
              <th className="px-6 py-4 font-bold">Min Order</th>
              <th className="px-6 py-4 font-bold">Usage</th>
              <th className="px-6 py-4 font-bold">Schedule</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-black/20">
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-ink-black/60">
                  No discount codes found. Create one above.
                </td>
              </tr>
            ) : (
              discounts.map((discount: any) => {
                const now = new Date();
                const isExpired = discount.expires_at && new Date(discount.expires_at) < now;
                const isNotStarted = discount.starts_at && new Date(discount.starts_at) > now;
                const isLimitReached = discount.usage_limit && discount.times_used >= discount.usage_limit;

                return (
                  <tr key={discount.id} className={`hover:bg-warm-parchment/50 transition-colors ${!discount.is_active || isExpired ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-base">{discount.code}</span>
                    </td>
                    <td className="px-6 py-4 uppercase text-xs font-bold">{discount.type}</td>
                    <td className="px-6 py-4 font-bold">
                      {discount.type === 'percentage' ? `${Number(discount.value)}%` : `Rs ${Number(discount.value).toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4">
                      {Number(discount.min_order_value) > 0 ? `Rs ${Number(discount.min_order_value).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={isLimitReached ? 'text-thread-red font-bold' : ''}>
                        {discount.times_used}{discount.usage_limit ? ` / ${discount.usage_limit}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-ink-black/60">
                      {isExpired && <div className="text-thread-red font-bold">EXPIRED</div>}
                      {isNotStarted && <div className="text-blue-700 font-bold">SCHEDULED</div>}
                      {!isExpired && !isNotStarted && discount.starts_at && (
                        <div>{new Date(discount.starts_at).toLocaleDateString()} — {discount.expires_at ? new Date(discount.expires_at).toLocaleDateString() : '∞'}</div>
                      )}
                      {!discount.starts_at && !discount.expires_at && <span>Always</span>}
                    </td>
                    <td className="px-6 py-4">
                      <form action={async () => {
                        "use server";
                        await toggleDiscountStatus(discount.id, discount.is_active);
                      }}>
                        <button type="submit" className={`border px-2 py-1 text-xs uppercase font-bold tracking-wider ${
                          discount.is_active ? 'border-green-800 text-green-800' : 'border-ink-black/40 text-ink-black/40'
                        }`}>
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form className="inline" action={async () => {
                        "use server";
                        await deleteDiscount(discount.id);
                      }}>
                        <button type="submit" className="text-xs font-bold uppercase tracking-widest text-thread-red hover:underline underline-offset-2">
                          Delete
                        </button>
                      </form>
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
