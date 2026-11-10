export function makeRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// 80% of requests go to the 200 popular products, 20% to the other 800
export function pickId(random: () => number): string {
  if (random() < 0.8) return String(1 + Math.floor(random() * 200));
  return String(201 + Math.floor(random() * 800));
}