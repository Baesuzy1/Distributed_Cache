import "dotenv/config";
import { HashRing } from "../../ring/src/ring";
import { CacheClient } from "../../cache-node/src/client";
import { getProductFromDb, updatePriceInDb, Product } from "./db";

const TTL_MS = Number(process.env.CACHE_TTL_MS ?? 10000);

export const nodes = [4001, 4002, 4003].map((port) => ({
  id: `node-${port - 4000}`,
  host: "localhost",
  port,
}));
export const ring = new HashRing(100);
nodes.forEach((n) => ring.addNode(n));

const cache = new CacheClient(ring);
export const stats = { hits: 0, misses: 0 };

export async function lookup(id: string): Promise<{ product: Product | undefined; source: "cache" | "database" }> {
  const cached = await cache.get("product:" + id);
  if (cached !== undefined) {
    stats.hits++;
    return { product: JSON.parse(cached), source: "cache" };
  }
  stats.misses++;
  const product = await getProductFromDb(id);
  if (product) await cache.put("product:" + id, JSON.stringify(product), TTL_MS);
  return { product, source: "database" };
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await lookup(id)).product;
}

export async function updatePrice(id: string, price: number): Promise<void> {
  await updatePriceInDb(id, price);          // 1. change the truth
  await cache.delete("product:" + id);       // 2. throw away the old copy
}