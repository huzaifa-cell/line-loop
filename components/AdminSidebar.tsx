"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payment-verification", label: "Payment Verification" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/content", label: "Content & Banners" },
];

const secondaryNavItems = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/activity-log", label: "Activity Log" },
];

export function AdminSidebar({ userEmail, role }: { userEmail?: string; role?: string }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-64 bg-ink-black text-ivory-mist flex flex-col shrink-0">
      <div className="p-6 border-b border-ivory-mist/20">
        <Link href="/admin" className="font-label-caps text-label-caps tracking-widest uppercase">
          LINE&LOOP
        </Link>
        <div className="mt-1 text-[10px] text-ivory-mist/60 uppercase tracking-wider">
          Admin Dashboard
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-6 py-2.5 text-sm transition-colors ${
                  isActive(item.href, item.exact)
                    ? "bg-ivory-mist/15 text-white font-semibold border-r-2 border-ivory-mist"
                    : "hover:bg-ivory-mist/10 hover:text-white text-ivory-mist/80"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-6 my-4">
          <div className="stitch-line opacity-50 w-full h-[1px]"></div>
        </div>

        <ul className="space-y-0.5">
          {secondaryNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-6 py-2.5 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-ivory-mist/15 text-white font-semibold border-r-2 border-ivory-mist"
                    : "hover:bg-ivory-mist/10 hover:text-white text-ivory-mist/80"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-ivory-mist/20 text-xs space-y-2">
        <div>{userEmail}</div>
        <div className="text-ivory-mist/60 uppercase text-[10px] font-bold">
          Role: {role}
        </div>
        <SignOutButton>
          <button className="mt-2 text-[10px] uppercase tracking-widest text-ivory-mist/50 hover:text-ivory-mist transition-colors">
            Sign Out →
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
