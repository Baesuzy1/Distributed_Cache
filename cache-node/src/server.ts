import http from "node:http";
import { LRUCache } from "./lru-cache";

const port = Number(process.argv[2] ?? 4001);
const cache = new LRUCache(1000);
cache.startSweeper(5000);

function send(res: http.ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "Content-Type": "text/plain" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return send(res, 200, "ok");
  }

  if (url.pathname.startsWith("/cache/")) {
    const key = decodeURIComponent(url.pathname.slice("/cache/".length));

    if (req.method === "GET") {
      const value = cache.get(key);
      if (value === undefined) return send(res, 404, "miss");
      return send(res, 200, value);
    }

    if (req.method === "PUT") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const ttlParam = url.searchParams.get("ttl");
        const ttl = ttlParam ? Number(ttlParam) : undefined;
        cache.put(key, body, ttl);
        send(res, 200, "stored");
      });
      return;
    }
  }

  send(res, 404, "not found");
});

server.listen(port, () => console.log(`cache node listening on port ${port}`));