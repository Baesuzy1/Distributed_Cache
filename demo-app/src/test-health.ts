import { HashRing } from "../../ring/src/ring";
import { HealthChecker } from "../../cache-node/src/health-checker";

const nodes = [4001, 4002, 4003].map((port) => ({
  id: `node-${port - 4000}`,
  host: "localhost",
  port,
}));

const ring = new HashRing(100);
nodes.forEach((n) => ring.addNode(n));

const checker = new HealthChecker(ring, nodes, 2);
checker.start(1000);                                  // check every 1 second

let seconds = 0;
const printer = setInterval(() => {
  seconds++;
  console.log(`t=${seconds}s  product:1 is owned by:`, ring.getNode("product:1")?.id);
  if (seconds >= 40) {
    clearInterval(printer);
    checker.stop();
  }
}, 1000);