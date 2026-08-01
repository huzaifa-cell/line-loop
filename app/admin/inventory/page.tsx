import { getInventoryItems, adjustInventory } from "./actions";

export default async function AdminInventoryPage() {
  const items = await getInventoryItems();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
      </div>

      <div className="bg-ivory-mist border border-ink-black">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm">
          <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Product</th>
              <th className="px-6 py-4 font-bold">Variant / SKU</th>
              <th className="px-6 py-4 font-bold">Stock</th>
              <th className="px-6 py-4 font-bold">Threshold</th>
              <th className="px-6 py-4 font-bold text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-black/20">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-ink-black/60">
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((item: any) => {
                const isLow = item.stock_quantity <= item.low_stock_threshold;
                return (
                  <tr key={item.id} className={`hover:bg-warm-parchment/50 transition-colors ${isLow ? 'bg-thread-red/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold">{item.products.title}</div>
                      {!item.products.is_published && (
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-black/60">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{item.color} / {item.size}</div>
                      <div className="text-xs text-ink-black/60">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isLow ? 'text-thread-red' : ''}`}>
                        {item.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-black/60">{item.low_stock_threshold}</td>
                    <td className="px-6 py-4 text-right">
                      <form className="flex items-center justify-end gap-2" action={async (formData) => {
                        "use server";
                        const amount = parseInt(formData.get('amount') as string);
                        if (!amount) return;
                        await adjustInventory(item.id, amount, 'manual_adjustment');
                      }}>
                        <input 
                          type="number" 
                          name="amount" 
                          placeholder="+/-"
                          className="w-16 bg-transparent border border-ink-black p-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-ink-black rounded-none"
                        />
                        <button type="submit" className="bg-ink-black text-ivory-mist px-3 py-1 text-xs uppercase tracking-wider font-bold hover:bg-ink-black/80 transition-colors">
                          Set
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
    </div>
  );
}
