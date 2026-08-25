// Minimal cookie-session auth for the /admin area — no external dependencies.
// Passwords are hashed with scrypt (built into Node's crypto module); sessions
// are a signed, expiring token stored in an HttpOnly cookie.

import crypto from "node:crypto";
import { getDb, saveDb } from "./db.js";

const SESSION_COOKIE = "innotek_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  const db = getDb();
  if (!db.settings.sessionSecret) {
    db.settings.sessionSecret = crypto.randomBytes(32).toString("hex");
    saveDb();
  }
  return db.settings.sessionSecret;
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(value) {
  const h = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${h}`;
}

function unsign(token) {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export function createSessionCookie() {
  const expires = Date.now() + SESSION_TTL_MS;
  const token = sign(`admin:${expires}`);
  const expiresDate = new Date(expires).toUTCString();
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax; Expires=${expiresDate}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  const value = unsign(token);
  if (!value) return false;
  const [type, expiresStr] = value.split(":");
  if (type !== "admin") return false;
  return Date.now() < Number(expiresStr);
}

export { SESSION_COOKIE };
