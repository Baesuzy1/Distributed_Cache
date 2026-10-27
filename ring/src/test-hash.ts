import { hashKey } from "./hash";

for (const name of ["node-1", "node-2", "node-3", "apple", "apple", "apple2"]) {
  console.log(name, "->", hashKey(name));
}