"use client";

import { useCart, FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const isVideo = (url: string) => url?.match(/\.(mp4|webm|mov)$/i);
  const { lines, isOpen, close, remove, setQty, count, subtotal, shipping, total, freeShippingRemaining } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 bg-espresso/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-[100vw] bg-white border-l border-espresso/10 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="px-4 md:px-8 pt-6 md:pt-8 pb-4 border-b border-espresso/10">
              <div className="flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-espresso uppercase tracking-[0.15em]">
                  Your Bag
                </h2>
                <button
                  onClick={close}
                  className="text-espresso/70 hover:text-brand-red transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
              <p className="font-label-caps text-[11px] text-espresso/70 uppercase tracking-widest mt-1">
                {count} {count === 1 ? "Item" : "Items"}
              </p>
            </div>

            {/* Content */}
            {lines.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 text-center">
                <span className="material-symbols-outlined text-[64px] text-espresso/30 mb-6">
                  shopping_bag
                </span>
                <h3 className="font-headline-sm text-headline-sm text-espresso mb-2">
                  Your bag is empty
                </h3>
                <p className="font-body-md text-espresso/70 mb-8">
                  Discover our curated collection of handmade garments.
                </p>
                <Link
                  href="/shop"
                  onClick={close}
                  className="bg-brand-red text-white px-8 py-3 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md hover:bg-espresso hover:text-white transition-all duration-500"
                >
                  Shop the Collection
                </Link>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
                  {lines.map((line) => (
                    <motion.div
                      key={`${line.id}-${line.size}-${line.colour}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-sm bg-beige/30">
                        {isVideo(line.image) ? (
                          <video src={line.image} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                        ) : (
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-label-caps text-[11px] text-espresso uppercase tracking-wider truncate">
                              {line.name}
                            </h4>
                            <button
                              onClick={() => remove(line.id, line.size, line.colour)}
                              className="text-espresso/50 hover:text-brand-red transition-colors shrink-0 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                          <p className="font-label-caps text-[10px] text-espresso/60 uppercase tracking-wider mt-0.5">
                            Size: {line.size} | Color: {line.colour}
                          </p>
                          <p className="font-label-caps text-[12px] text-espresso font-medium mt-1">
                            Rs. {line.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-espresso/20 rounded-sm w-fit mt-2">
                          <button
                            onClick={() => setQty(line.id, line.size, line.colour, line.qty - 1)}
                            className="px-2.5 py-1 text-espresso/70 hover:text-brand-red transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="px-3 py-1 font-body-md text-espresso text-sm min-w-[28px] text-center">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => setQty(line.id, line.size, line.colour, line.qty + 1)}
                            className="px-2.5 py-1 text-espresso/70 hover:text-brand-red transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Order Summary & CTA */}
                <div className="px-4 md:px-8 py-4 md:py-6 border-t border-espresso/10 bg-white">
                  {/* Free shipping progress */}
                  {lines.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-espresso/10">
                      {freeShippingRemaining > 0 ? (
                        <>
                          <p className="font-label-caps text-[10px] text-espresso/70 uppercase tracking-widest mb-2">
                            Rs. {freeShippingRemaining.toLocaleString()} away from free shipping
                          </p>
                          <div className="w-full h-1.5 bg-espresso/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-red rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="font-label-caps text-[10px] text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          You qualify for free shipping!
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between font-label-caps text-[11px] uppercase tracking-widest">
                      <span className="text-espresso/70">Subtotal</span>
                      <span className="text-espresso font-medium">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-label-caps text-[11px] uppercase tracking-widest">
                      <span className="text-espresso/70">Shipping</span>
                      <span className={shipping === 0 ? "text-brand-red font-medium" : "text-espresso font-medium"}>
                        {shipping === 0 ? "FREE" : `Rs. ${shipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-espresso/10 pt-4 mb-6">
                    <div className="flex justify-between font-headline-sm text-[18px] uppercase tracking-wider">
                      <span className="text-espresso font-medium">Total</span>
                      <span className="text-espresso font-medium">Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={close}
                    className="block w-full bg-brand-red text-white py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md hover:bg-espresso hover:text-white transition-all duration-500 text-center shadow-lg shadow-brand-red/20"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={close}
                    className="w-full mt-3 py-2 text-center font-label-caps text-[11px] text-espresso/70 underline underline-offset-4 decoration-espresso/20 hover:text-brand-red hover:decoration-brand-red transition-all cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
