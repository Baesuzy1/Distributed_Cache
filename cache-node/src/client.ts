import { HashRing, NodeInfo } from "../../ring/src/ring";

export class CacheClient {
  constructor(private ring: HashRing) {}

  private urlFor(node: NodeInfo, key: string): string {
    return `http://${node.host}:${node.port}/cache/${encodeURIComponent(key)}`;
  }

  // Knock on a shelf's door. If nobody answers (or too slowly), return nothing.
  private async request(url: string, init: RequestInit = {}): Promise<Response | undefined> {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(500) });
    } catch {
      return undefined;
    }
  }

  async get(key: string): Promise<string | undefined> {
    const node = this.ring.getNode(key);
    if (!node) return undefined;
    const res = await this.request(this.urlFor(node, key));
    if (!res || res.status !== 200) return undefined;   // dead shelf or a plain miss
    return await res.text();
  }

  async put(key: string, value: string, ttlMs?: number): Promise<void> {
    const node = this.ring.getNode(key);
    if (!node) return;
    const query = ttlMs !== undefined ? `?ttl=${ttlMs}` : "";
    await this.request(this.urlFor(node, key) + query, { method: "PUT", body: value });
  }

  async delete(key: string): Promise<boolean> {
    const node = this.ring.getNode(key);
    if (!node) return false;
    const res = await this.request(this.urlFor(node, key), { method: "DELETE" });
    return res?.status === 200;
  }
}