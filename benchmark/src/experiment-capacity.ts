import { HashRing } from "../../ring/src/ring";
import { LRUCache } from "../../cache-node/src/lru-cache";
import { makeRandom, pickId } from "./workload";

const REQUESTS = 100000;

for (const capacity of [25, 50, 100, 200, 400, 800]) {
  const ring = new HashRing(100);
  const shelves = new Map<string, LRUCache>();
  for (const n of [1, 2, 3]) {
    const id = `node-${n}`;
    ring.addNode({ id, host: "localhost", port: 4000 + n });
    shelves.set(id, new LRUCache(capacity));
  }

  const random = makeRandom(42);
  let hits = 0;
  for (let i = 0; i < REQUESTS; i++) {
    const key = "product:" + pickId(random);
    const shelf = shelves.get(ring.getNode(key)!.id)!;
    if (shelf.get(key) !== undefined) hits++;
    else shelf.put(key, "x");
  }
  console.log(`${String(capacity).padStart(4)} per shelf (${String(capacity * 3).padStart(4)} total): hit rate ${((hits / REQUESTS) * 100).toFixed(1)}%`);
}