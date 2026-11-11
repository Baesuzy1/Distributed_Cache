import { lookup, invalidate, setSingleFlight } from "../../demo-app/src/app";
import { getDbReads } from "../../demo-app/src/db";

async function scenario(label: string, protectedMode: boolean) {
  setSingleFlight(protectedMode);
  await invalidate("1");                              // the popular copy disappears
  const before = getDbReads();
  const start = performance.now();
  await Promise.all(Array.from({ length: 100 }, () => lookup("1")));   // 100 customers at the same moment
  const ms = Math.round(performance.now() - start);
  console.log(`${label}: 100 simultaneous requests -> ${getDbReads() - before} database trips, ${ms} ms`);
}

async function main() {
  await scenario("WITHOUT protection", false);
  await scenario("WITH protection   ", true);
  process.exit(0);
}
main();