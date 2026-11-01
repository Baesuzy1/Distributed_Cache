import { HashRing } from "../../ring/src/ring";

const ring = new HashRing(100);
for (const port of [4001, 4002, 4003]) {
  ring.addNode({ id: `node-${port - 4000}`, host: "localhost", port });
}
console.log("product:1 is owned by:", ring.getNode("product:1"));