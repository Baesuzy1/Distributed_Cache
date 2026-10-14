import { LRUCache } from "./lru-cache";

const cache = new LRUCache(2);   // room for only 2 items

cache.put("a", "1");
cache.put("b", "2");
cache.get("a");        // we just used "a", so "b" is now the oldest
cache.put("c", "3");   // cache is full, so something gets evicted

console.log(cache.get("a"));
console.log(cache.get("b"));
console.log(cache.get("c"));