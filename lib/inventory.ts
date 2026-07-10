import { readStore, mutateStore } from "./file-store";
import { products, type Product } from "./products";

/**
 * File-based inventory store — mirrors product variant stock into a mutable
 * JSON file so orders can decrement and cancels can restock without touching
 * the static catalog source.
 *
 * Seed is generated from lib/products.ts on first read. The admin dashboard
 * (later pass) will edit this file directly.
 */

export interface InventoryEntry {
  productId: string;
  variantId: string;
  count: number;
}

type InventoryMap = Record<string, number>; // variantId -> count

const FILE = "inventory.json";

/** Build the initial inventory map from the static product catalog. */
function seed(): InventoryMap {
  const map: InventoryMap = {};
  for (const p of products) {
    for (const v of p.variants) {
      map[v.id] = v.inventoryCount;
    }
  }
  return map;
}

/** Read the full inventory map, seeding from products if the file is absent. */
export async function getInventory(): Promise<InventoryMap> {
  return readStore<InventoryMap>(FILE, seed());
}

/** Get the live stock count for a single variant. */
export async function getVariantStock(variantId: string): Promise<number> {
  const inv = await getInventory();
  return inv[variantId] ?? 0;
}

/**
 * Decrement inventory for a set of variant IDs (called on order placement).
 * Returns the updated map. Does NOT go below zero.
 */
export async function decrementInventory(
  items: { variantId: string; qty: number }[]
): Promise<InventoryMap> {
  return mutateStore<InventoryMap>(FILE, seed(), (current) => {
    const next = { ...current };
    for (const item of items) {
      const current = next[item.variantId] ?? 0;
      next[item.variantId] = Math.max(0, current - item.qty);
    }
    return next;
  });
}

/**
 * Restock inventory for a set of variant IDs (called on order cancellation).
 */
export async function restockInventory(
  items: { variantId: string; qty: number }[]
): Promise<InventoryMap> {
  return mutateStore<InventoryMap>(FILE, seed(), (current) => {
    const next = { ...current };
    for (const item of items) {
      const current = next[item.variantId] ?? 0;
      next[item.variantId] = current + item.qty;
    }
    return next;
  });
}

/**
 * Merge live inventory back into product objects for display.
 * Returns products with updated variant counts and derived soldOut flags.
 */
export async function getProductsWithLiveInventory(): Promise<Product[]> {
  const inv = await getInventory();
  return products.map((p) => {
    const variants = p.variants.map((v) => ({
      ...v,
      inventoryCount: inv[v.id] ?? 0,
    }));
    const totalStock = variants.reduce((n, v) => n + v.inventoryCount, 0);
    return { ...p, variants, soldOut: totalStock === 0 };
  });
}

/** Update a single product's live stock (for admin, later pass). */
export async function getProductStock(
  productId: string
): Promise<{ variantId: string; count: number }[]> {
  const inv = await getInventory();
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return product.variants.map((v) => ({
    variantId: v.id,
    count: inv[v.id] ?? 0,
  }));
}
