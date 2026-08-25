// Zero-dependency "database": a JSON file on disk, loaded into memory at startup
// and flushed back to disk after every mutation. Perfectly fine for a low-traffic
// corporate site, and trivial to swap for a real database later if the site grows.

import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "db.json");

let cache = null;
let writeQueue = Promise.resolve();

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

export async function loadDb() {
  if (cache) return cache;
  if (!existsSync(DB_PATH)) {
    throw new Error(`Ma'lumotlar bazasi topilmadi: ${DB_PATH}`);
  }
  const raw = await readFile(DB_PATH, "utf-8");
  cache = JSON.parse(raw);
  return cache;
}

export function getDb() {
  if (!cache) throw new Error("DB hali yuklanmagan — avval loadDb() chaqiring");
  return cache;
}

export async function saveDb() {
  // Serialize writes so concurrent admin requests can't corrupt the file, and
  // write atomically (tmp file + rename) so a crash mid-write never truncates it.
  writeQueue = writeQueue.then(async () => {
    const tmpPath = DB_PATH + ".tmp";
    await writeFile(tmpPath, JSON.stringify(cache, null, 2), "utf-8");
    await rename(tmpPath, DB_PATH);
  });
  return writeQueue;
}

// ---- Collection helpers -------------------------------------------------

export function listAll(collection) {
  return getDb()[collection] || [];
}

export function findById(collection, id) {
  return listAll(collection).find((x) => String(x.id) === String(id));
}

export function findBySlug(collection, slug) {
  return listAll(collection).find((x) => x.slug === slug);
}

export async function insert(collection, item) {
  const db = getDb();
  if (!db[collection]) db[collection] = [];
  const record = { id: nextId(db[collection]), createdAt: new Date().toISOString(), ...item };
  db[collection].push(record);
  await saveDb();
  return record;
}

export async function update(collection, id, patch) {
  const db = getDb();
  const idx = (db[collection] || []).findIndex((x) => String(x.id) === String(id));
  if (idx === -1) return null;
  db[collection][idx] = { ...db[collection][idx], ...patch, updatedAt: new Date().toISOString() };
  await saveDb();
  return db[collection][idx];
}

export async function remove(collection, id) {
  const db = getDb();
  const before = (db[collection] || []).length;
  db[collection] = (db[collection] || []).filter((x) => String(x.id) !== String(id));
  await saveDb();
  return before !== db[collection].length;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[ʻʼ'’`]/g, "")
    .replace(/[^a-z0-9а-яёʻ]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || crypto.randomBytes(4).toString("hex");
}

export function ensureDataDir() {
  const dir = path.join(__dirname, "..", "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
