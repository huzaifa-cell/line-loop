import Link from "next/link";
import { getActivityLogs } from "./actions";

function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    "order.status_change": "Updated order status",
    "order.note_added": "Added order note",
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
    "review.delete": "Deleted review",
    "banner.update": "Updated banner",
    "settings.update": "Updated settings",
  };
  return labels[action] || action.replace(/[._]/g, ' ');
}

export default async function AdminActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>
}) {
  const { page, filter } = await searchParams;
  const currentPage = Number(page) || 1;
  const currentFilter = filter || 'all';

  const { logs, totalPages } = await getActivityLogs(currentPage, currentFilter);

  const filters = [
    { value: 'all', label: 'All Activity' },
    { value: 'order', label: 'Orders' },
    { value: 'bank_transfer', label: 'Payments' },
    { value: 'product', label: 'Products' },
    { value: 'discount', label: 'Discounts' },
    { value: 'review', label: 'Reviews' },
    { value: 'banner', label: 'Content' },
    { value: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/admin/activity-log?filter=${f.value}`}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-bold border transition-colors ${
              currentFilter === f.value
                ? 'bg-ink-black text-ivory-mist border-ink-black'
                : 'border-ink-black/30 text-ink-black/60 hover:bg-ink-black/5'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-ivory-mist border border-ink-black">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-black/60">
            No activity found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-ink-black/20">
            {logs.map((log: any) => (
              <div key={log.id} className="p-6 hover:bg-warm-parchment/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-bold">{formatActionLabel(log.action)}</div>
                    <div className="text-sm text-ink-black/80">
                      by <span className="font-medium">{log.profiles?.full_name || log.profiles?.email || 'System'}</span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <pre className="text-xs text-ink-black/60 bg-ink-black/5 p-2 mt-2 rounded-none border border-ink-black/10 inline-block overflow-x-auto max-w-xl">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-xs text-ink-black/50 whitespace-nowrap ml-4">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i + 1}
              href={`/admin/activity-log?filter=${currentFilter}&page=${i + 1}`}
              className={`w-8 h-8 flex items-center justify-center border text-xs font-bold ${
                currentPage === i + 1 
                  ? 'bg-ink-black text-ivory-mist border-ink-black' 
                  : 'border-ink-black hover:bg-ink-black/5'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
