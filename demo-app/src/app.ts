import { HashRing } from "../../ring/src/ring";
import { CacheClient } from "../../cache-node/src/client";
import { getProductFromDb, Product } from "./db";

const ring = new HashRing(100);
for (const port of [4001, 4002, 4003]) {
  ring.addNode({ id: `node-${port - 4000}`, host: "localhost", port });
}
const cache = new CacheClient(ring);

export async function getProduct(id: string): Promise<Product | undefined> {
  const cached = await cache.get("product:" + id);
  if (cached !== undefined) return JSON.parse(cached);          // found on the shelf

  const product = await getProductFromDb(id);                   // slow trip to the library
  if (product) {
    await cache.put("product:" + id, JSON.stringify(product), 10000);   // keep a copy for 10 seconds
  }
  return product;
}