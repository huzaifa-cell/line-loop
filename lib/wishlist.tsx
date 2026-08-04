"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { syncWishlistAction, toggleWishlistItemAction } from "@/app/actions/wishlist";

interface WishlistState {
  items: string[];
  isLoaded: boolean;
  toggleItem: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistState | null>(null);
const STORAGE_KEY = "lineloop-wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded: authLoaded } = useAuth();
  const [items, setItems] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoaded) return;

    const loadAndSync = async () => {
      // 1. Always check local storage first
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      let localItems: string[] = [];
      try {
        localItems = raw ? JSON.parse(raw) : [];
      } catch {
        localItems = [];
      }

      // Guest mode
      if (!userId) {
        setItems(localItems);
        setIsLoaded(true);
        return;
      }

      // Auth mode: sync local items to Supabase
      const result = await syncWishlistAction(localItems);
      if (result.success && result.productIds) {
        setItems(result.productIds);
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        // Fallback on error
        setItems(localItems);
      }
      setIsLoaded(true);
    };

    loadAndSync();
  }, [userId, authLoaded]);

  const toggleItem = useCallback(
    async (productId: string) => {
      let isAdding = false;
      let previousItems: string[] = [];

      setItems((prev) => {
        previousItems = prev;
        isAdding = !prev.includes(productId);
        
        const newItems = isAdding
          ? [...prev, productId]
          : prev.filter((id) => id !== productId);

        if (!userId && typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        }
        return newItems;
      });

      if (userId) {
        const result = await toggleWishlistItemAction(productId, isAdding);
        if (!result.success) {
          setItems(previousItems);
          console.error("Failed to update wishlist:", result.error);
        }
      }
    },
    [userId]
  );

  return (
    <WishlistContext.Provider value={{ items, isLoaded, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
