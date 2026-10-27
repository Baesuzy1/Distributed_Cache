import { HashRing } from "../../ring/src/ring";
import { CacheClient } from "./client";

async function main() {
  const ring = new HashRing(100);
  for (const port of [4001, 4002, 4003]) {
    ring.addNode({ id: `node-${port - 4000}`, host: "localhost", port });
  }
  const client = new CacheClient(ring);

  await client.put("greeting", "hello");
  console.log("via client:", await client.get("greeting"));

  for (const port of [4001, 4002, 4003]) {
    const res = await fetch(`http://localhost:${port}/cache/greeting`);
    console.log("port", port, "->", res.status);
  }
}
main();