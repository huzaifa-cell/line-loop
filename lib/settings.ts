import { readStore } from "./file-store";

/**
 * Store-wide settings — shaped so the admin dashboard (later pass) can edit
 * these without a schema migration. For now they are defaults read from disk.
 */

export interface StoreSettings {
  codFee: number; // PKR integer; added to COD orders only if > 0
  freeShippingThreshold: number; // PKR; free standard shipping above this
  standardShipping: number; // PKR flat rate
  expressShipping: number; // PKR flat rate
  currency: string;
}

const DEFAULTS: StoreSettings = {
  codFee: 150,
  freeShippingThreshold: 10000,
  standardShipping: 350,
  expressShipping: 800,
  currency: "Rs",
};

const FILE = "settings.json";

export async function getSettings(): Promise<StoreSettings> {
  return readStore<StoreSettings>(FILE, DEFAULTS);
}
