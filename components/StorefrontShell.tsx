"use client";

import { usePathname } from "next/navigation";
import { TopNavBar } from "@/components/TopNavBar";
import { Footer } from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import CookieConsent from "@/components/CookieConsent";
import React from "react";

export function StorefrontShell({ children, announcementBar }: { children: React.ReactNode, announcementBar?: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {announcementBar}
      <TopNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <CookieConsent />
    </>
  );
}
