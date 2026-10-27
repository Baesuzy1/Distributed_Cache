import { hashKey } from "./hash";

export interface NodeInfo {
  id: string;
  host: string;
  port: number;
}

interface RingPoint {
  position: number;
  node: NodeInfo;
}

export class HashRing {
    private points: RingPoint[] = [];

  constructor(private virtualNodes: number = 100) {}

  addNode(node: NodeInfo): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      this.points.push({ position: hashKey(node.id + "#" + i), node });
    }
    this.points.sort((a, b) => a.position - b.position);
  }

  removeNode(nodeId: string): void {
    this.points = this.points.filter((p) => p.node.id !== nodeId);
  }

  getNode(key: string): NodeInfo | undefined {
    if (this.points.length === 0) return undefined;

    const pos = hashKey(key);

    // binary search: find the first point at or after pos
    let low = 0;
    let high = this.points.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.points[mid].position < pos) {
        low = mid + 1;   // too far left, look right
      } else {
        high = mid;      // this one could be it, look left
      }
    }

    // YOUR TURN: add the fix here (see below)
    if(low === this.points.length)low=0;
    return this.points[low].node;
  }
}