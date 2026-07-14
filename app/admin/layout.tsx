import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  
  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }

  const user = await currentUser();

  return (
    <div className="flex h-screen bg-warm-parchment text-ink-black font-body-md overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-black text-ivory-mist flex flex-col">
        <div className="p-6 border-b border-ivory-mist/20">
          <Link href="/admin" className="font-label-caps text-label-caps tracking-widest uppercase">
            LINE&LOOP
          </Link>
          <div className="mt-1 text-[10px] text-ivory-mist/60 uppercase tracking-wider">
            Admin Dashboard
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/payment-verification" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Payment Verification
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link href="/admin/inventory" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Inventory
              </Link>
            </li>
            <li>
              <Link href="/admin/customers" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Customers
              </Link>
            </li>
            <li>
              <Link href="/admin/discounts" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Discounts
              </Link>
            </li>
            <li>
              <Link href="/admin/reviews" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/admin/content" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Content & Banners
              </Link>
            </li>
          </ul>
          
          <div className="px-6 my-4">
            <div className="stitch-line opacity-50 w-full h-[1px]"></div>
          </div>
          
          <ul className="space-y-1">
            <li>
              <Link href="/admin/analytics" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Settings
              </Link>
            </li>
            <li>
              <Link href="/admin/activity-log" className="block px-6 py-2 text-sm hover:bg-ivory-mist/10 hover:text-white transition-colors">
                Activity Log
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-ivory-mist/20 text-xs">
          {user?.emailAddresses[0]?.emailAddress}
          <div className="mt-1 text-ivory-mist/60 uppercase text-[10px] font-bold">
            Role: {role}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-warm-parchment border-b border-ink-black flex items-center px-8 justify-between shrink-0">
          <div className="font-label-caps text-label-caps uppercase">Admin Panel</div>
          <div className="flex gap-4">
            <Link href="/" target="_blank" className="text-sm underline underline-offset-4 decoration-ink-black/40 hover:decoration-ink-black">
              View Store
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
