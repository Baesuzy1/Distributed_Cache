import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ?? "cache_demo",
  });

  const rows: (number | string)[][] = [];
  for (let i = 1; i <= 1000; i++) {
    rows.push([i, `Product ${i}`, 10 + (i % 90) * 5]);
  }
  await conn.query("INSERT IGNORE INTO products (id, name, price) VALUES ?", [rows]);

  const [count] = await conn.query("SELECT COUNT(*) AS total FROM products");
  console.log(count);
  await conn.end();
}
main();