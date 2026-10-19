// One item in the list
class ListNode {
  key: string;
  value: string;
  expiresAt: number | null;   // null means "never expires"
  prev: ListNode | null = null;
  next: ListNode | null = null;

  constructor(key: string, value: string, expiresAt: number | null = null) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
  }
}

export class LRUCache {
  private map = new Map<string, ListNode>();
  private head: ListNode;
  private tail: ListNode;
  private sweeper: NodeJS.Timeout | null = null;

  constructor(private capacity: number) {
    this.head = new ListNode("", "");
    this.tail = new ListNode("", "");
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
    // Take a node out of the list by joining its two neighbours
  private removeNode(node: ListNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  // Put a node right after head = the "most recently used" spot
  private addToFront(node: ListNode): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  get(key: string): string | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;

    // expired? treat it as a miss and throw it away
    if (node.expiresAt !== null && Date.now() > node.expiresAt) {
      this.removeNode(node);
      this.map.delete(key);   // both places again, remember
      return undefined;
    }

    this.removeNode(node);
    this.addToFront(node);
    return node.value;
  }
  
    put(key: string, value: string, ttlMs?: number): void {
    const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : null;

    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = expiresAt;   // a new write also resets the timer
      this.removeNode(existing);
      this.addToFront(existing);
      return;
    }

    if (this.map.size >= this.capacity) {
      const oldest = this.tail.prev!;
      this.removeNode(oldest);
      this.map.delete(oldest.key);
    }

    const node = new ListNode(key, value, expiresAt);
    this.map.set(key, node);
    this.addToFront(node);
    
  }
    // Go through everything and remove expired items
  sweep(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, node] of this.map) {
      if (node.expiresAt !== null && now > node.expiresAt) {
        this.removeNode(node);
        this.map.delete(key);   // both places, as always
        removed++;
      }
    }
    return removed;
  }

  get size(): number {
    return this.map.size;
  }

  startSweeper(intervalMs: number): void {
    this.sweeper = setInterval(() => this.sweep(), intervalMs);
    this.sweeper.unref();
  }

  stopSweeper(): void {
    if (this.sweeper) clearInterval(this.sweeper);
    this.sweeper = null;
  }
    delete(key: string): boolean {
    const node = this.map.get(key);
    if (!node) return false;      // nothing to delete
    this.removeNode(node);
    this.map.delete(key);         // both places, as always
    return true;
  }
}