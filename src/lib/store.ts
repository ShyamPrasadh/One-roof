import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Db } from "./types";
import { hashPassword, newId } from "./security";

/**
 * File-based store used until Supabase is connected. All reads and writes go through
 * readDb/writeDb so the rest of the app doesn't depend on how data is persisted.
 */
// On Vercel the project folder is read-only; only /tmp is writable (and it is not shared between instances).
const DB_PATH =
  process.env.DB_PATH ??
  (process.env.VERCEL ? path.join(os.tmpdir(), "one-roof-db.json") : path.join(process.cwd(), "data", "db.json"));

export function readDb(): Db {
  if (!fs.existsSync(/*turbopackIgnore: true*/ DB_PATH)) {
    const db = seed();
    writeDb(db);
    return db;
  }
  return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ DB_PATH, "utf8")) as Db;
}

export function writeDb(db: Db): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function seed(): Db {
  const now = new Date().toISOString();
  const categories = [
    ["Cement", "cement"],
    ["Sand & Aggregates", "sand-aggregates"],
    ["Bricks & Blocks", "bricks-blocks"],
    ["Steel / TMT", "steel-tmt"],
    ["Pipes & Fittings", "pipes-fittings"],
    ["Electrical", "electrical"],
    ["Plumbing", "plumbing"],
    ["Paints & Putty", "paints-putty"],
    ["Tiles", "tiles"],
    ["Sanitary Ware", "sanitary-ware"],
    ["Tools", "tools"],
    ["Hardware", "hardware"],
  ].map(([name, slug]) => ({ id: slug, name, slug }));

  const sample = (
    name: string,
    brand: string,
    categoryId: string,
    price: number,
    unitLabel: string,
    gstRate: number,
    hsn: string,
    stock: number,
  ) => ({
    id: newId("p"),
    name,
    brand,
    categoryId,
    description: "",
    price,
    unitLabel,
    gstRate,
    hsn,
    stock,
    active: true,
    createdAt: now,
  });

  // Sample catalogue only. Replace prices, GST rates and HSN codes with your real ones.
  const products = [
    sample("OPC 53 Grade Cement", "UltraTech", "cement", 420, "per bag (50 kg)", 28, "2523", 200),
    sample("PPC Cement", "ACC", "cement", 390, "per bag (50 kg)", 28, "2523", 200),
    sample("River Sand", "Local", "sand-aggregates", 4500, "per brass", 5, "2505", 50),
    sample("UPVC Pipe 4 inch", "Supreme", "pipes-fittings", 650, "per 3 m length", 18, "3917", 80),
    sample("CPVC Pipe 1/2 inch", "Astral", "pipes-fittings", 180, "per 3 m length", 18, "3917", 120),
    sample("Interior Emulsion Paint", "Asian Paints", "paints-putty", 1450, "per 20 L", 18, "3209", 40),
  ];

  const adminPhone = process.env.ADMIN_PHONE ?? "9999999999";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin@123";

  return {
    settings: {
      storeName: "One Roof Building Solutions",
      gstin: "",
      address: "Thammampatti, Salem district, Tamil Nadu",
      stateName: "Tamil Nadu",
      stateCode: "33",
      phone: "",
      // Approximate placeholder. Set the exact store location in Settings.
      lat: 11.6643,
      lng: 78.146,
      deliveryBaseFee: 40,
      deliveryPerKm: 10,
      deliveryMinOrder: 500,
      deliveryMaxKm: 25,
      invoiceCounter: 0,
    },
    categories,
    products,
    customers: [],
    admins: [
      { id: newId("a"), name: "Owner", phone: adminPhone, passwordHash: hashPassword(adminPassword) },
    ],
    orders: [],
  };
}
