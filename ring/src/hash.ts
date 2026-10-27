import { createHash } from "node:crypto";

export function hashKey(key: string): number {
  const digest = createHash("md5").update(key).digest();
  return digest.readUInt32BE(0);
}