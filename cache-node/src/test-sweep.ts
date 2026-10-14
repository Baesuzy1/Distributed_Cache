import { LRUCache } from "./lru-cache";

const cache = new LRUCache(100);
for (let i = 0; i < 5; i++) cache.put("k" + i, "v", 100);
cache.put("keep", "v");

console.log("size at start:", cache.size);

setTimeout(() => {
  console.log("size before sweep:", cache.size);
  console.log("removed:", cache.sweep());
  console.log("size after sweep:", cache.size);
}, 200);