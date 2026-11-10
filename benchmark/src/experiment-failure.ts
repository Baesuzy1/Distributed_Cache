import { HashRing } from "../../ring/src/ring";
import { LRUCache } from "../../cache-node/src/lru-cache";
import { makeRandom, pickId } from "./workload";

const CAPACITY = 100;
const WINDOW = 2000;
const TOTAL = 60000;
const KILL_AT = 20001;
const REVIVE_AT = 40001;

const nodes = [1, 2, 3].map((n) => ({ id: `node-${n}`, host: "localhost", port: 4000 + n }));
const ring = new HashRing(100);
const shelves = new Map<string, LRUCache>();
for (const n of nodes) {
  ring.addNode(n);
  shelves.set(n.id, new LRUCache(CAPACITY));
}

const random = makeRandom(42);
let hits = 0;

for (let i = 1; i <= TOTAL; i++) {
  if (i === KILL_AT) {
    ring.removeNode("node-2");
    shelves.delete("node-2");          // its memory is gone
    console.log("--- node-2 dies ---");
  }
  if (i === REVIVE_AT) {
    ring.addNode(nodes[1]);
    shelves.set("node-2", new LRUCache(CAPACITY));   // comes back empty
    console.log("--- node-2 returns (empty) ---");
  }

  const key = "product:" + pickId(random);
  const shelf = shelves.get(ring.getNode(key)!.id)!;
  if (shelf.get(key) !== undefined) hits++;
  else shelf.put(key, "x");

  if (i % WINDOW === 0) {
    const pct = (hits / WINDOW) * 100;
    console.log(`requests ${String(i - WINDOW + 1).padStart(6)}-${String(i).padStart(6)}: ${pct.toFixed(1).padStart(5)}%  ${"#".repeat(Math.round(pct / 2))}`);
    hits = 0;
  }
}