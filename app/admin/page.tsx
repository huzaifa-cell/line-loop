export default async function AdminDashboardPage() {
  return (
    <div className="max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-ink-black bg-ivory-mist p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Today's Orders</div>
          <div className="text-3xl font-normal font-display-lg">0</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Pending Bank Transfers</div>
          <div className="text-3xl font-normal font-display-lg text-thread-red">0</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-ink-black/60 mb-2">Low Stock Alerts</div>
          <div className="text-3xl font-normal font-display-lg text-thread-red">0</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink-black pb-2">Recent Orders</h2>
          <div className="border border-ink-black bg-ivory-mist">
            <div className="p-8 text-center text-sm text-ink-black/60">
              No recent orders found.
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest border-b border-ink-black pb-2">Recent Activity</h2>
          <div className="border border-ink-black bg-ivory-mist">
            <div className="p-8 text-center text-sm text-ink-black/60">
              No recent activity found.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
