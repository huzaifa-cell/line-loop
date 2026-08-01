import Link from "next/link";
import { getAdminProducts, toggleProductPublishStatus, deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-ink-black text-ivory-mist px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-ivory-mist border border-ink-black">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm">
          <thead className="bg-warm-parchment border-b border-ink-black text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Product</th>
              <th className="px-6 py-4 font-bold">Category</th>
              <th className="px-6 py-4 font-bold">Price</th>
              <th className="px-6 py-4 font-bold">Total Stock</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-black/20">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-ink-black/60">
                  No products found. Add your first product.
                </td>
              </tr>
            ) : (
              products.map((product: any) => {
                const totalStock = product.product_variants.reduce((sum: number, v: any) => sum + v.stock_quantity, 0);
                return (
                  <tr key={product.id} className="hover:bg-warm-parchment/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{product.title}</div>
                      <div className="text-xs text-ink-black/60">{product.slug}</div>
                    </td>
                    <td className="px-6 py-4">{product.categories?.name || '—'}</td>
                    <td className="px-6 py-4">Rs {product.base_price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {totalStock > 0 ? (
                        <span>{totalStock} in stock</span>
                      ) : (
                        <span className="text-thread-red border border-thread-red px-2 py-0.5 text-xs font-bold uppercase">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <form action={async () => {
                        "use server";
                        await toggleProductPublishStatus(product.id, product.is_published);
                      }}>
                        <button type="submit" className={`border px-2 py-1 text-xs uppercase font-bold tracking-wider ${product.is_published ? 'border-ink-black text-ink-black' : 'border-ink-black/40 text-ink-black/40'}`}>
                          {product.is_published ? 'Published' : 'Draft'}
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <Link href={`/admin/products/${product.id}`} className="text-xs font-bold uppercase tracking-widest hover:underline underline-offset-2">
                        Edit
                      </Link>
                      <form className="inline" action={async () => {
                        "use server";
                        await deleteProduct(product.id);
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
    </div>
  );
}
