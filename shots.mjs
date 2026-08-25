import { chromium } from "playwright";
import fs from "node:fs";

const outDir = "/home/claude/shots";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

const pages = [
  { url: "http://localhost:3000/", name: "01-home" },
  { url: "http://localhost:3000/services", name: "02-services" },
  { url: "http://localhost:3000/calculator", name: "03-calculator" },
  { url: "http://localhost:3000/projects", name: "04-projects" },
  { url: "http://localhost:3000/contact", name: "05-contact" },
];

// Desktop screenshots
const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const p of pages) {
  const page = await desktopCtx.newPage();
  await page.goto(p.url, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/${p.name}-desktop.png`, fullPage: true });
  await page.close();
}
await desktopCtx.close();

// Mobile screenshot of homepage
const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await mobileCtx.newPage();
await mp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await mp.screenshot({ path: `${outDir}/06-home-mobile.png`, fullPage: true });
await mp.close();
await mobileCtx.close();

// Admin login + dashboard
const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const ap = await adminCtx.newPage();
await ap.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await ap.screenshot({ path: `${outDir}/07-admin-login.png` });
await ap.fill('input[name="password"]', "Innotek2026!");
await Promise.all([ap.waitForNavigation(), ap.click('button[type="submit"]')]);
await ap.screenshot({ path: `${outDir}/08-admin-dashboard.png`, fullPage: true });
await ap.goto("http://localhost:3000/admin/services", { waitUntil: "networkidle" });
await ap.screenshot({ path: `${outDir}/09-admin-services.png`, fullPage: true });
await ap.close();
await adminCtx.close();

await browser.close();
console.log("done");
