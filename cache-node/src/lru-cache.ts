// One item in the list
class ListNode {
  key: string;
  value: string;
  prev: ListNode | null = null;
  next: ListNode | null = null;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }
  
}

export class LRUCache {
  private map = new Map<string, ListNode>();
  private head: ListNode;
  private tail: ListNode;

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
    if (!node) return undefined;   // not in cache = a "miss"
    this.removeNode(node);         // step 1: pull it out of the middle
    this.addToFront(node);         // step 2: move it to the front
    return node.value;
  }
    put(key: string, value: string): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;      // key already there: update the value
      this.removeNode(existing);
      this.addToFront(existing);   // and count it as "just used"
      return;
    }

    if (this.map.size >= this.capacity) {
      const oldest = this.tail.prev!;  // last real item (the one before the dummy tail)
      this.removeNode(oldest);
      this.map.delete(oldest.key);     // remove from the Map too
    }

    const node = new ListNode(key, value);
    this.map.set(key, node);
    this.addToFront(node);
  }
}