import { getProduct } from "../../demo-app/src/app";
import { getProductFromDb, getDbReads } from "../../demo-app/src/db";

const REQUESTS = Number(process.argv[2] ?? 2000);

// A small random number maker. Same seed = same sequence, so every run is repeatable.
function makeRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// 80% of requests go to the 200 popular products, 20% to the other 800
function pickId(random: () => number): string {
  if (random() < 0.8) return String(1 + Math.floor(random() * 200));
  return String(201 + Math.floor(random() * 800));
}

function percentile(sorted: number[], p: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

async function run(label: string, fetchOne: (id: string) => Promise<unknown>, count: number) {
  const random = makeRandom(42);
  const tripsBefore = getDbReads();
  const times: number[] = [];

  const started = Date.now();
  for (let i = 0; i < REQUESTS; i++) {
    const id = pickId(random);
    const t = performance.now();
    await fetchOne(id);
    times.push(performance.now() - t);
  }
  const totalSeconds = (Date.now() - started) / 1000;

  const trips = getDbReads() - tripsBefore;
  const hitRate = ((REQUESTS - trips) / REQUESTS) * 100;
  const sorted = [...times].sort((a, b) => a - b);

  console.log(`--- ${label} ---`);
  console.log(`requests: ${REQUESTS} | database trips: ${trips} | hit rate: ${hitRate.toFixed(1)}%`);
  console.log(
    `p50: ${percentile(sorted, 50).toFixed(1)} ms | p95: ${percentile(sorted, 95).toFixed(1)} ms | p99: ${percentile(sorted, 99).toFixed(1)} ms`
  );
  console.log(`total time: ${totalSeconds.toFixed(1)} s`);
}

async function main() {
  await run("WITH cache", getProduct, REQUESTS);
  await run("WITHOUT cache (database only)", getProductFromDb, Math.min(REQUESTS,2000));
  process.exit(0);
}
main();