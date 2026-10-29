import { getProduct } from "./app";
import { getDbReads } from "./db";

async function main() {
  for (let i = 1; i <= 4; i++) {
    const start = Date.now();
    const p = await getProduct("1");
    console.log(`try ${i}: ${p?.name} took ${Date.now() - start} ms, trips to library: ${getDbReads()}`);
  }
}
main();