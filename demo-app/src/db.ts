import "dotenv/config";
import mysql, { RowDataPacket } from "mysql2/promise";

export interface Product {
  id: string;
  name: string;
  price: number;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "cache_demo",
  connectionLimit: 5,
});
const delaysMs = Number(process.env.DB_DELAY_MS ?? 0);
let trips = 0;

export function getDbReads(): number {
  return trips;
}

export async function getProductFromDb(id: string): Promise<Product | undefined> {
  trips++;
  if(delaysMs > 0) await new Promise((resolve) => setTimeout(resolve, delaysMs));
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, price FROM products WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return undefined;
  const r = rows[0];
  return { id: String(r.id), name: r.name, price: r.price };
}
export async function updatePriceInDb(id: string,price:number): Promise<void> {
  await pool.query("UPDATE products SET price = ? WHERE id = ?", [price, id]);
}