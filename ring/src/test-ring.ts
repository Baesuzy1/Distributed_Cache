import { HashRing } from "./ring";

const ring = new HashRing(100);
ring.addNode({ id: "node-1", host: "localhost", port: 4001 });
ring.addNode({ id: "node-2", host: "localhost", port: 4002 });
ring.addNode({ id: "node-3", host: "localhost", port: 4003 });

const counts: Record<string, number> = {};
for (let i = 0; i < 1000; i++) {
  const node = ring.getNode("key" + i)!;
  counts[node.id] = (counts[node.id] ?? 0) + 1;
}
console.log(counts);