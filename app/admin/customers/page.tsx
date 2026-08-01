import Link from "next/link";
import { getCustomers } from "./actions";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams;
  const customers = await getCustomers(search);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <div className="text-sm text-ink-black/60">{customers.length} customers</div>
      </div>

      {/* Search */}
      <form className="flex gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search || ''}
          placeholder="Search by name or email..."
          className="flex-1 bg-transparent border border-ink-black px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none max-w-md"
        />
        <button type="submit" className="bg-ink-black text-ivory-mist px-5 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors">
          Search
        </button>
        {search && (
          <Link href="/admin/customers" className="border border-ink-black px-5 py-2 text-xs uppercase tracking-widest font-bold hover:bg-ink-black/5 transition-colors">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-ivory-mist border border-ink-black">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm">
          <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Customer</th>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Orders</th>
              <th className="px-6 py-4 font-bold">Total Spent</th>
              <th className="px-6 py-4 font-bold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-black/20">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-ink-black/60">
                  {search ? 'No customers match your search.' : 'No customers found.'}
                </td>
              </tr>
            ) : (
              customers.map((customer: any) => (
                <tr key={customer.id} className="hover:bg-warm-parchment/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{customer.full_name || '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-ink-black/70">{customer.email}</td>
                  <td className="px-6 py-4">
                    <span className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${
                      customer.role === 'admin' ? 'border-thread-red text-thread-red' :
                      customer.role === 'staff' ? 'border-blue-700 text-blue-700' :
                      'border-ink-black/40 text-ink-black/60'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{customer.orderCount}</td>
                  <td className="px-6 py-4 font-bold">Rs {customer.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-4 text-ink-black/60">{new Date(customer.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
