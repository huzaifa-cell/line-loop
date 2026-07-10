import { promises as fs } from "fs";
import path from "path";

/**
 * Generic file-based JSON store — the persistence layer for orders, reviews,
 * inventory, and settings. No external DB required.
 *
 * Each store lives as a single JSON file under .data/ (gitignored).
 * All operations are synchronous-in-spirit: read-modify-write with a simple
 * process-level lock to avoid interleaved writes in dev.
 *
 * NOTE: This is a single-process store suitable for a self-hosted Next.js
 * server. When the admin dashboard lands (later pass), these shapes drop into
 * Supabase without restructuring.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

let writeChain: Promise<void> = Promise.resolve();

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readRaw<T>(file: string): Promise<T | null> {
  const fp = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(fp, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Read a store file. Returns `fallback` if the file does not exist yet.
 */
export async function readStore<T>(file: string, fallback: T): Promise<T> {
  const data = await readRaw<T>(file);
  return data ?? fallback;
}

/**
 * Write a store file. Serialised through `writeChain` so concurrent
 * Server Actions in dev don't interleave reads and writes.
 */
export async function writeStore<T>(file: string, data: T): Promise<void> {
  const run = writeChain.then(async () => {
    await ensureDir();
    const fp = path.join(DATA_DIR, file);
    await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf-8");
  });
  writeChain = run.catch(() => {});
  await run;
}

/**
 * Read-modify-write helper. Pass a mutator that receives the current data
 * and returns the new data. The write is serialised.
 */
export async function mutateStore<T>(
  file: string,
  fallback: T,
  mutator: (current: T) => T | Promise<T>
): Promise<T> {
  const current = await readStore(file, fallback);
  const next = await mutator(current);
  await writeStore(file, next);
  return next;
}
