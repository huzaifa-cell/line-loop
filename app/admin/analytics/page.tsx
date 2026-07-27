import { getAnalyticsData } from "./actions";
import { RevenueChart, OrdersChart } from "./AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="border border-ink-black bg-ivory-mist p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-black/60 mb-1">Today</div>
          <div className="text-xl font-bold">Rs {data.todayRevenue.toLocaleString()}</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-black/60 mb-1">This Week</div>
          <div className="text-xl font-bold">Rs {data.weekRevenue.toLocaleString()}</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-black/60 mb-1">This Month</div>
          <div className="text-xl font-bold">Rs {data.monthRevenue.toLocaleString()}</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-black/60 mb-1">All Time</div>
          <div className="text-xl font-bold">Rs {data.allTimeRevenue.toLocaleString()}</div>
        </div>
        <div className="border border-ink-black bg-ivory-mist p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-black/60 mb-1">Avg Order Value</div>
          <div className="text-xl font-bold">Rs {data.avgOrderValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-ink-black bg-ivory-mist p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Revenue (Last 30 Days)</h3>
          <RevenueChart data={data.dailyData} />
        </div>
        <div className="border border-ink-black bg-ivory-mist p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Orders (Last 30 Days)</h3>
          <OrdersChart data={data.dailyData} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders by Status */}
        <div className="border border-ink-black bg-ivory-mist p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(data.statusCounts).length === 0 ? (
              <div className="text-sm text-ink-black/60">No orders yet</div>
            ) : (
              Object.entries(data.statusCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-ink-black/10 h-2">
                        <div
                          className="bg-ink-black h-2"
                          style={{ width: `${((count as number) / data.totalOrders) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{count as number}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border border-ink-black bg-ivory-mist p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {Object.entries(data.paymentCounts).length === 0 ? (
              <div className="text-sm text-ink-black/60">No data yet</div>
            ) : (
              Object.entries(data.paymentCounts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([method, count]) => {
                  const total = Object.values(data.paymentCounts).reduce((s, v) => s + (v as number), 0);
                  const pct = Math.round(((count as number) / total) * 100);
                  return (
                    <div key={method} className="flex justify-between items-center">
                      <span className="text-sm uppercase">{method}</span>
                      <span className="text-xs font-bold">{count as number} ({pct}%)</span>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="border border-ink-black bg-ivory-mist p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Top Products</h3>
          <div className="space-y-3">
            {data.topProducts.length === 0 ? (
              <div className="text-sm text-ink-black/60">No sales data yet</div>
            ) : (
              data.topProducts.slice(0, 5).map((product, i) => (
                <div key={product.name} className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{i + 1}. {product.name}</div>
                    <div className="text-[10px] text-ink-black/50">{product.qty} sold</div>
                  </div>
                  <span className="text-xs font-bold ml-2 shrink-0">Rs {product.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
