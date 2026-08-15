import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-espresso border-t border-mocha px-margin-mobile md:px-margin-desktop py-section-gap-mobile md:py-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter">
        {/* Brand Info */}
        <div className="md:col-span-8 space-y-6 md:space-y-8">
          <Image 
            src="/lineloop-logo.png" 
            alt="LINE&LOOP Logo" 
            width={160} 
            height={50} 
            className="h-10 md:h-12 w-auto rounded-sm"
            sizes="(max-width: 768px) 120px, 160px"
            loading="lazy"
            style={{ width: "auto" }}
          />
          <p className="font-body-md text-beige max-w-xs leading-relaxed text-sm md:text-base">
            Curating luxury artisanal garments with a focus on sustainable slow fashion and heritage craftsmanship. Designed for the feminine silhouette.
          </p>
          <div className="flex gap-4">
            <Link href="https://www.instagram.com/line.n.loopofficial?igsh=MTNscjYwajN0a2xuYg==" target="_blank" rel="noopener noreferrer" className="text-ivory hover:text-brand-red transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16.113 7.893h.01"/><circle cx="12" cy="12" r="4"/></svg>
            </Link>
            <Link href="https://www.tiktok.com/@line.n.loopofficial?_r=1&_t=ZS-98kYR3JJxLR" target="_blank" rel="noopener noreferrer" className="text-ivory hover:text-brand-red transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
            </Link>
          </div>
        </div>
        {/* Links */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-4">
          <h4 className="font-label-caps text-label-caps text-ivory uppercase tracking-widest mb-2 md:mb-4">Information</h4>
          <div className="flex flex-col gap-2 md:gap-0">
            <Link href="/shop" className="font-body-md text-beige hover:text-brand-red transition-colors">SHOP</Link>
            <Link href="/about" className="font-body-md text-beige hover:text-brand-red transition-colors">ABOUT</Link>
            <Link href="https://www.instagram.com/line.n.loopofficial?igsh=MTNscjYwajN0a2xuYg==" target="_blank" rel="noopener noreferrer" className="font-body-md text-beige hover:text-brand-red transition-colors">INSTAGRAM</Link>
            <Link href="https://www.tiktok.com/@line.n.loopofficial?_r=1&_t=ZS-98kYR3JJxLR" target="_blank" rel="noopener noreferrer" className="font-body-md text-beige hover:text-brand-red transition-colors">TIKTOK</Link>
          </div>
        </div>
      </div>
      <div className="mt-12 md:mt-24 pt-8 border-t border-mocha flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-body-md text-beige text-xs md:text-sm">© 2026 LINE&LOOP. HANDMADE GARMENTS, MADE SLOWLY.</span>
        <div className="flex gap-8">
          <Link href="/privacy" className="font-label-caps text-[10px] text-beige hover:text-ivory">PRIVACY</Link>
          <Link href="/terms" className="font-label-caps text-[10px] text-beige hover:text-ivory">TERMS</Link>
          <Link href="/shipping-returns" className="font-label-caps text-[10px] text-beige hover:text-ivory">SHIPPING & RETURNS</Link>
        </div>
      </div>
    </footer>
  );
}
