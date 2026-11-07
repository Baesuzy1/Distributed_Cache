import { HashRing, NodeInfo } from "../../ring/src/ring";

export class HealthChecker {
  private failures = new Map<string, number>();    // node id -> failed checks in a row
  private isOnRing = new Map<string, boolean>();   // node id -> is it on the signboard now?
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private ring: HashRing,
    private nodes: NodeInfo[],
    private maxFailures: number = 2
  ) {
    for (const node of nodes) {
      this.failures.set(node.id, 0);
      this.isOnRing.set(node.id, true);
    }
  }

  // Ask one shelf "are you alive?"
  private async ping(node: NodeInfo): Promise<boolean> {
    try {
      const res = await fetch(`http://${node.host}:${node.port}/health`, {
        signal: AbortSignal.timeout(500),
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  // One round of the watchman's walk
  async checkAll(): Promise<void> {
    for (const node of this.nodes) {
      const alive = await this.ping(node);

      if (alive) {
        this.failures.set(node.id, 0);                       // reset the strike count
        if (!this.isOnRing.get(node.id)) {
          this.ring.addNode(node);                           // it's back, put it on the board
          this.isOnRing.set(node.id, true);
          console.log(`[health] ${node.id} is back, added to the ring`);
        }
      } else {
        const strikes = (this.failures.get(node.id) ?? 0) + 1;
        this.failures.set(node.id, strikes);
        if (strikes >= this.maxFailures && this.isOnRing.get(node.id)) {
          this.ring.removeNode(node.id);                     // too many strikes, take it off
          this.isOnRing.set(node.id, false);
          console.log(`[health] ${node.id} is down, removed from the ring`);
        }
      }
    }
  }

  start(intervalMs: number): void {
    this.timer = setInterval(() => this.checkAll(), intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}