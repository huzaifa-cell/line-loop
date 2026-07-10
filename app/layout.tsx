import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import AnnouncementBar from "@/components/AnnouncementBar";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CookieConsent from "@/components/CookieConsent";
import SearchOverlay from "@/components/SearchOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lineloop.example"),
  title: {
    default: "LINE&LOOP — Handmade Ladies' Garments, Made Slowly",
    template: "%s — LINE&LOOP",
  },
  description:
    "LINE&LOOP makes handmade ladies' garments — kurtis, shalwar kameez, trousers and dupattas — cut, dyed and stitched by hand in Pakistan, in small batches.",
  keywords: [
    "handmade garments Pakistan",
    "handmade ladies clothes",
    "kurti",
    "shalwar kameez",
    "hand block print",
    "slow fashion",
    "artisan made",
  ],
  openGraph: {
    title: "LINE&LOOP — Handmade Ladies' Garments, Made Slowly",
    description:
      "Handmade ladies' garments — cut, dyed and stitched by hand in Pakistan. Made slowly, in small batches.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
    <ClerkProvider>
      <body className="min-h-full flex flex-col bg-warm-parchment text-ink-black">
        <CartProvider>
          <AnnouncementBar />
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          <CookieConsent />
        </CartProvider>
      </body>
    </ClerkProvider>
    </html>
  );
}
