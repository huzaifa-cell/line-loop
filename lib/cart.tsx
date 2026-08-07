"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { Product } from "./types";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  colour: string;
  qty: number;
  variantId: string;
}

/** Orders above this amount get free shipping */
export const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 500;

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingRemaining: number;
  open: () => void;
  close: () => void;
  add: (product: Product, size: string, colour: string, qty?: number, variantId?: string) => void;
  remove: (id: string, size: string, colour: string) => void;
  setQty: (id: string, size: string, colour: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "lineloop-cart";

function lineKey(id: string, size: string, colour: string) {
  return `${id}__${size}__${colour}`;
}

// Lazy initialiser — reads localStorage only in the browser (no SSR access).
function loadInitialLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadInitialLines);
  const [isOpen, setIsOpen] = useState(false);

  // Persist writes to localStorage (synchronising React -> external store).
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add: CartState["add"] = useCallback(
    (product, size, colour, qty = 1, variantId) => {
      setLines((prev) => {
        const k = lineKey(product.id, size, colour);
        const existing = prev.find(
          (l) => lineKey(l.id, l.size, l.colour) === k
        );
        if (existing) {
          return prev.map((l) =>
            lineKey(l.id, l.size, l.colour) === k
              ? { ...l, qty: l.qty + qty }
              : l
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size,
            colour,
            qty,
            variantId: variantId ?? `${product.id}-${size}-${colour}`,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const remove: CartState["remove"] = useCallback((id, size, colour) => {
    setLines((prev) =>
      prev.filter((l) => lineKey(l.id, l.size, l.colour) !== lineKey(id, size, colour))
    );
  }, []);

  const setQty: CartState["setQty"] = useCallback(
    (id, size, colour, qty) => {
      if (qty < 1) {
        remove(id, size, colour);
        return;
      }
      setLines((prev) =>
        prev.map((l) =>
          lineKey(l.id, l.size, l.colour) === lineKey(id, size, colour)
            ? { ...l, qty }
            : l
        )
      );
    },
    [remove]
  );

  const clear = useCallback(() => setLines([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.qty, 0),
    [lines]
  );

  const shipping = lines.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = subtotal + shipping;

  const value: CartState = {
    lines,
    isOpen,
    count,
    subtotal,
    shipping,
    total,
    freeShippingRemaining,
    open,
    close,
    add,
    remove,
    setQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

