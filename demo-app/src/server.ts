import http from "node:http";
import { lookup, updatePrice, stats, ring, nodes } from "./app";
import { getDbReads } from "./db";
import { HealthChecker } from "../../cache-node/src/health-checker";
import fs from "node:fs";
import path from "node:path";
const checker = new HealthChecker(ring, nodes, 2);
checker.start(1000);

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost:3000");
  const parts = url.pathname.split("/").filter(Boolean);   // "/product/1" becomes ["product", "1"]

  try {
    if (req.method === "GET" && url.pathname === "/"){
        res.writeHead(200, {"Content-Type": "text/html"});
        return res.end(fs.readFileSync(path.join(__dirname,"..","public","dashboard.html")));
    }
    if (req.method === "GET" && parts[0] === "product" && parts.length === 2) {
      const start = performance.now();
      const { product, source } = await lookup(parts[1]);
      if (!product) return json(res, 404, { error: "not found" });
      return json(res, 200, { product, source, ms: Math.round((performance.now() - start) * 10) / 10 });
    }
    if (req.method === "POST" && parts[0] === "product" && parts[2] === "price") {
      await updatePrice(parts[1], Number(url.searchParams.get("value")));
      return json(res, 200, { updated: true });
    }
    if (req.method === "GET" && parts[0] === "stats") {
      const total = stats.hits + stats.misses;
      return json(res, 200, { ...stats, hitRate: total ? stats.hits / total : 0, dbTrips: getDbReads() });
    }
    if (req.method === "GET" && parts[0] === "nodes") return json(res, 200, checker.status());
    if (req.method === "GET" && parts[0] === "owner" && parts.length === 2) {
      return json(res, 200, ring.getNode(parts[1]) ?? null);
    }
    json(res, 404, { error: "not found" });
  } catch (err) {
    json(res, 500, { error: String(err) });
  }
});

server.listen(3000, () => console.log("demo app on http://localhost:3000"));