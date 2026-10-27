import { HashRing, NodeInfo } from "../../ring/src/ring";

export class CacheClient {
  constructor(private ring: HashRing) {}

  private urlFor(node: NodeInfo, key: string): string {
    return `http://${node.host}:${node.port}/cache/${encodeURIComponent(key)}`;
  }

  async get(key: string): Promise<string | undefined> {
    const node = this.ring.getNode(key);          // 1. ask the signboard
    if (!node) return undefined;
    const res = await fetch(this.urlFor(node, key));   // 2. go to that shelf
    if (res.status === 404) return undefined;     // a miss
    return await res.text();
  }

  async put(key: string, value: string, ttlMs?: number): Promise<void> {
    const node = this.ring.getNode(key);
    if (!node) return;
    const query = ttlMs !== undefined ? `?ttl=${ttlMs}` : "";
    await fetch(this.urlFor(node, key) + query, { method: "PUT", body: value });
  }
    async delete(key: string): Promise<boolean> {
    const node = this.ring.getNode(key);
    if (!node) return false;
    const res = await fetch(this.urlFor(node, key), { method: "DELETE" });
    return res.status === 200;
  }
}