import { HashRing } from "./ring";
import { hashKey } from "./hash";

const TOTAL = 10000;
const keys: string[] = [];
for (let i = 0; i < TOTAL; i++) keys.push("key" + i);

// ----- The ring way -----
const ring = new HashRing(100);
for (const n of [1, 2, 3]) {
  ring.addNode({ id: `node-${n}`, host: "localhost", port: 4000 + n });
}

const before = keys.map((k) => ring.getNode(k)!.id);      // who owns each key now

ring.addNode({ id: "node-4", host: "localhost", port: 4004 });   // add a 4th shelf

const after = keys.map((k) => ring.getNode(k)!.id);       // who owns each key now

let ringMoved = 0;
let movedElsewhere = 0;
for (let i = 0; i < TOTAL; i++) {
  if (before[i] !== after[i]) {
    ringMoved++;
    if (after[i] !== "node-4") movedElsewhere++;
  }
}

// ----- The old way: hash % number of shelves -----
let moduloMoved = 0;
for (const k of keys) {
  if (hashKey(k) % 3 !== hashKey(k) % 4) moduloMoved++;
}

console.log(`Ring way:   ${ringMoved} of ${TOTAL} keys changed owner`);
console.log(`   ...of those, moved to a shelf other than node-4: ${movedElsewhere}`);
console.log(`Modulo way: ${moduloMoved} of ${TOTAL} keys changed owner`);