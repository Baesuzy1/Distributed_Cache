import { LRUCache } from "./lru-cache";

const cache = new LRUCache(5);
cache.put("short", "I expire fast", 100);   // lives 100 ms
cache.put("forever", "I stay");              // no TTL

console.log("right away:", cache.get("short"), "|", cache.get("forever"));

setTimeout(() => {
  console.log("after 150ms:", cache.get("short"), "|", cache.get("forever"));
}, 150);