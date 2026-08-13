import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { ToastProvider } from "@/components/Toast";
import { StorefrontShell } from "@/components/StorefrontShell";
import AnnouncementBar from "@/components/AnnouncementBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lineandloop.shop"),
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
    "LINE&LOOP",
    "lineandloop",
    "line and loop",
    "Pakistani fashion",
    "hand stitched",
    "women clothing Pakistan",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LINE&LOOP — Handmade Ladies' Garments, Made Slowly",
    description:
      "Handmade ladies' garments — cut, dyed and stitched by hand in Pakistan. Made slowly, in small batches.",
    type: "website",
    url: "https://lineandloop.shop",
    siteName: "LINE&LOOP",
    locale: "en_US",
    images: [
      {
        url: "/lineloop-logo.png",
        width: 1200,
        height: 630,
        alt: "LINE&LOOP — Handmade Ladies' Garments",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LINE&LOOP — Handmade Ladies' Garments, Made Slowly",
    description:
      "Handmade ladies' garments — cut, dyed and stitched by hand in Pakistan. Made slowly, in small batches.",
    images: ["/lineloop-logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1A1616",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0&display=block"
        />
      </head>
    <ClerkProvider>
      <body className="min-h-screen flex flex-col bg-espresso text-ivory font-body-md overflow-x-hidden">
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <StorefrontShell announcementBar={<AnnouncementBar />}>{children}</StorefrontShell>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </ClerkProvider>
    </html>
  );
}
