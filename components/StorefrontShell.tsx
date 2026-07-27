"use client";

import { usePathname } from "next/navigation";
import { TopNavBar } from "@/components/TopNavBar";
import { Footer } from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import CookieConsent from "@/components/CookieConsent";
import AnnouncementBar from "@/components/AnnouncementBar";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <CookieConsent />
    </>
  );
}
