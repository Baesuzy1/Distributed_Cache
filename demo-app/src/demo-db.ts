export interface Product {
  id: string;
  name: string;
  price: number;
}

const products: Product[] = [
  { id: "1", name: "Notebook", price: 50 },
  { id: "2", name: "Pen", price: 10 },
  { id: "3", name: "Backpack", price: 800 },
];

let trips = 0;

export function getDbReads(): number {
  return trips;
}

export async function getProductFromDb(id: string): Promise<Product | undefined> {
  trips++;
  await new Promise((resolve) => setTimeout(resolve, 200)); // pretend the trip is slow
  return products.find((p) => p.id === id);
}