// INNOTEK INVEST — corporate website
// A single Node.js process, zero npm dependencies (only Node's built-in modules).
// Run with:  node server.js   (or `npm start`)

import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadDb, insert, findBySlug } from "./lib/db.js";
import { layout, esc } from "./lib/render.js";
import { isLang, DEFAULT_LANG } from "./lib/i18n.js";
import { parseCookies, isAuthenticated, createSessionCookie, clearSessionCookie, verifyPassword } from "./lib/auth.js";
import { getDb } from "./lib/db.js";

import { renderHome } from "./routes/home.js";
import { renderAboutPage } from "./routes/about.js";
import { renderServicesList, renderServiceDetail } from "./routes/services.js";
import { renderProjectsList, renderProjectDetail } from "./routes/projects.js";
import { renderCalculator } from "./routes/calculator.js";
import { renderBlogList, renderBlogDetail } from "./routes/blog.js";
import { renderFaqPage } from "./routes/faq.js";
import { renderVacanciesList, renderVacancyDetail } from "./routes/vacancies.js";
import { renderContactPage } from "./routes/contact.js";
import { renderAdvantagesPage } from "./routes/advantages.js";
import { renderExpertsPage } from "./routes/experts.js";

import { loginPage } from "./lib/admin-ui.js";
import { dashboardPage } from "./routes/admin/dashboard.js";
import * as SvcAdmin from "./routes/admin/services.js";
import * as ProjAdmin from "./routes/admin/projects.js";
import * as BlogAdmin from "./routes/admin/blog.js";
import * as FaqAdmin from "./routes/admin/faq.js";
import * as VacAdmin from "./routes/admin/vacancies.js";
import * as ExpAdmin from "./routes/admin/experts.js";
import * as MsgAdmin from "./routes/admin/messages.js";
import * as SettingsAdmin from "./routes/admin/settings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

// ---- small helpers -------------------------------------------------------

function resolveLang(req, url, res) {
  const q = url.searchParams.get("lang");
  const cookies = parseCookies(req.headers.cookie);
  if (q && isLang(q)) {
    if (cookies.lang !== q) {
      res.setHeader("Set-Cookie", `lang=${q}; Path=/; Max-Age=31536000; SameSite=Lax`);
    }
    return q;
  }
  if (cookies.lang && isLang(cookies.lang)) return cookies.lang;
  return DEFAULT_LANG;
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

async function parseForm(req) {
  const contentType = req.headers["content-type"] || "";
  const raw = await readBody(req);
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return new URLSearchParams(raw);
  }
  // Fallback: try to parse as urlencoded anyway.
  return new URLSearchParams(raw);
}

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function redirect(res, location, extraHeaders = {}) {
  res.writeHead(302, { Location: location, ...extraHeaders });
  res.end();
}

function notFound(lang, activePath) {
  return layout({
    lang,
    path: activePath,
    title: lang === "ru" ? "Страница не найдена" : lang === "en" ? "Page not found" : "Sahifa topilmadi",
    body: `<div class="container" style="padding:90px 20px;text-align:center">
      <h1>404</h1>
      <p>${lang === "ru" ? "Страница не найдена." : lang === "en" ? "Page not found." : "Sahifa topilmadi."}</p>
      <a class="btn btn-primary" href="/?lang=${lang}">${lang === "ru" ? "На главную" : lang === "en" ? "Back to home" : "Bosh sahifaga"}</a>
    </div>`,
  });
}

function requireAdmin(req, res) {
  if (!isAuthenticated(req)) {
    redirect(res, "/admin/login");
    return false;
  }
  return true;
}

function isValidPhone(v) {
  return typeof v === "string" && v.replace(/[^\d]/g, "").length >= 7;
}

// Very small path-param matcher: "/services/:slug" vs "/services/loyihalash"
function matchPath(pattern, pathname) {
  const pParts = pattern.split("/").filter(Boolean);
  const uParts = pathname.split("/").filter(Boolean);
  if (pParts.length !== uParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(":")) {
      params[pParts[i].slice(1)] = decodeURIComponent(uParts[i]);
    } else if (pParts[i] !== uParts[i]) {
      return null;
    }
  }
  return params;
}

// ---- static file serving -------------------------------------------------

async function serveStatic(pathname, res) {
  const rel = pathname.replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) return false; // path traversal guard
  if (!existsSync(filePath)) return false;
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".css" || ext === ".js" ? "public, max-age=300" : "public, max-age=86400",
    });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

// ---- main request handler -------------------------------------------------

async function handle(req, res) {
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  const pathname = decodeURIComponent(url.pathname);

  // Static assets
  if (req.method === "GET" && (pathname.startsWith("/styles.css") || pathname.startsWith("/script.js") || pathname.startsWith("/images/"))) {
    const served = await serveStatic(pathname, res);
    if (served) return;
  }

  const lang = resolveLang(req, url, res);

  try {
    // ---------------- Admin area ----------------
    if (pathname === "/admin/login") {
      if (req.method === "GET") return sendHtml(res, 200, loginPage());
      if (req.method === "POST") {
        const form = await parseForm(req);
        const password = form.get("password") || "";
        const db = getDb();
        if (verifyPassword(password, db.settings.adminPasswordHash)) {
          return redirect(res, "/admin", { "Set-Cookie": createSessionCookie() });
        }
        return sendHtml(res, 401, loginPage({ error: "Parol noto'g'ri." }));
      }
    }

    if (pathname === "/admin/logout" && req.method === "POST") {
      return redirect(res, "/admin/login", { "Set-Cookie": clearSessionCookie() });
    }

    if (pathname.startsWith("/admin")) {
      if (!requireAdmin(req, res)) return;
      const handled = await handleAdmin(req, res, pathname, url);
      if (handled) return;
      return sendHtml(res, 404, "Admin: sahifa topilmadi");
    }

    // ---------------- Public site ----------------
    if (req.method === "GET" && pathname === "/") {
      return sendHtml(res, 200, layout({ lang, path: "/", title: t_title(lang, "home"), body: renderHome(lang) }));
    }
    if (req.method === "GET" && pathname === "/about") {
      return sendHtml(res, 200, layout({ lang, path: "/about", title: t_title(lang, "about"), body: renderAboutPage(lang) }));
    }
    if (req.method === "GET" && pathname === "/services") {
      return sendHtml(res, 200, layout({ lang, path: "/services", title: t_title(lang, "services"), body: renderServicesList(lang) }));
    }
    let m;
    if (req.method === "GET" && (m = matchPath("/services/:slug", pathname))) {
      const body = renderServiceDetail(lang, m.slug);
      if (!body) return sendHtml(res, 404, notFound(lang, "/services"));
      return sendHtml(res, 200, layout({ lang, path: "/services", title: t_title(lang, "services"), body }));
    }
    if (req.method === "GET" && pathname === "/projects") {
      const category = url.searchParams.get("category") || null;
      return sendHtml(res, 200, layout({ lang, path: "/projects", title: t_title(lang, "projects"), body: renderProjectsList(lang, category) }));
    }
    if (req.method === "GET" && (m = matchPath("/projects/:slug", pathname))) {
      const body = renderProjectDetail(lang, m.slug);
      if (!body) return sendHtml(res, 404, notFound(lang, "/projects"));
      return sendHtml(res, 200, layout({ lang, path: "/projects", title: t_title(lang, "projects"), body }));
    }
    if (pathname === "/calculator") {
      if (req.method === "GET") {
        const success = url.searchParams.get("success") === "1";
        return sendHtml(res, 200, layout({ lang, path: "/calculator", title: t_title(lang, "calculator"), body: renderCalculator(lang, { success }) }));
      }
      if (req.method === "POST") {
        const form = await parseForm(req);
        const name = (form.get("name") || "").trim();
        const phone = (form.get("phone") || "").trim();
        if (!name || !isValidPhone(phone)) {
          return sendHtml(res, 400, layout({ lang, path: "/calculator", title: t_title(lang, "calculator"), body: renderCalculator(lang) }));
        }
        await insert("calcLeads", {
          name,
          phone,
          projectType: form.get("projectType") || "",
          area: form.get("area") || "",
          floors: form.get("floors") || "",
          extras: form.getAll ? form.getAll("extras") : [],
          estimateLow: Number(form.get("estimateLow") || 0),
          estimateHigh: Number(form.get("estimateHigh") || 0),
        });
        return redirect(res, `/calculator?lang=${lang}&success=1`);
      }
    }
    if (req.method === "GET" && pathname === "/blog") {
      return sendHtml(res, 200, layout({ lang, path: "/blog", title: t_title(lang, "blog"), body: renderBlogList(lang) }));
    }
    if (req.method === "GET" && (m = matchPath("/blog/:slug", pathname))) {
      const body = renderBlogDetail(lang, m.slug);
      if (!body) return sendHtml(res, 404, notFound(lang, "/blog"));
      return sendHtml(res, 200, layout({ lang, path: "/blog", title: t_title(lang, "blog"), body }));
    }
    if (req.method === "GET" && pathname === "/faq") {
      return sendHtml(res, 200, layout({ lang, path: "/faq", title: t_title(lang, "faq"), body: renderFaqPage(lang) }));
    }
    if (req.method === "GET" && pathname === "/advantages") {
      return sendHtml(res, 200, layout({ lang, path: "/advantages", title: t_title(lang, "advantages"), body: renderAdvantagesPage(lang) }));
    }
    if (req.method === "GET" && pathname === "/experts") {
      return sendHtml(res, 200, layout({ lang, path: "/experts", title: t_title(lang, "experts"), body: renderExpertsPage(lang) }));
    }
    if (req.method === "GET" && pathname === "/vacancies") {
      return sendHtml(res, 200, layout({ lang, path: "/vacancies", title: t_title(lang, "vacancies"), body: renderVacanciesList(lang) }));
    }
    if ((m = matchPath("/vacancies/:slug", pathname))) {
      if (req.method === "GET") {
        const success = url.searchParams.get("success") === "1";
        const body = renderVacancyDetail(lang, m.slug, { success });
        if (!body) return sendHtml(res, 404, notFound(lang, "/vacancies"));
        return sendHtml(res, 200, layout({ lang, path: "/vacancies", title: t_title(lang, "vacancies"), body }));
      }
      if (req.method === "POST") {
        const vacancy = findBySlug("vacancies", m.slug);
        if (!vacancy) return sendHtml(res, 404, notFound(lang, "/vacancies"));
        const form = await parseForm(req);
        const name = (form.get("name") || "").trim();
        const phone = (form.get("phone") || "").trim();
        if (!name || !isValidPhone(phone)) {
          return sendHtml(res, 400, layout({ lang, path: "/vacancies", title: t_title(lang, "vacancies"), body: renderVacancyDetail(lang, m.slug) }));
        }
        await insert("vacancyApplications", {
          vacancyId: vacancy.id,
          vacancyTitle: vacancy.title.uz,
          name,
          phone,
          email: (form.get("email") || "").trim(),
          message: (form.get("message") || "").trim(),
        });
        return redirect(res, `/vacancies/${m.slug}?lang=${lang}&success=1`);
      }
    }
    if (pathname === "/contact") {
      if (req.method === "GET") {
        const success = url.searchParams.get("success") === "1";
        return sendHtml(res, 200, layout({ lang, path: "/contact", title: t_title(lang, "contact"), body: renderContactPage(lang, { success }) }));
      }
      if (req.method === "POST") {
        const form = await parseForm(req);
        const name = (form.get("name") || "").trim();
        const phone = (form.get("phone") || "").trim();
        const message = (form.get("message") || "").trim();
        if (!name || !isValidPhone(phone) || !message) {
          return sendHtml(res, 400, layout({ lang, path: "/contact", title: t_title(lang, "contact"), body: renderContactPage(lang) }));
        }
        await insert("messages", {
          name,
          phone,
          email: (form.get("email") || "").trim(),
          service: (form.get("service") || "").trim(),
          message,
        });
        return redirect(res, `/contact?lang=${lang}&success=1`);
      }
    }

    return sendHtml(res, 404, notFound(lang, pathname));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<h1>500</h1><p>Server xatosi yuz berdi.</p>`);
  }
}

function t_title(lang, key) {
  const titles = {
    home: { uz: "Bosh sahifa", ru: "Главная", en: "Home" },
    about: { uz: "Biz haqimizda", ru: "О компании", en: "About" },
    services: { uz: "Xizmatlar", ru: "Услуги", en: "Services" },
    projects: { uz: "Loyihalar", ru: "Проекты", en: "Projects" },
    calculator: { uz: "Kalkulyator", ru: "Калькулятор", en: "Calculator" },
    blog: { uz: "Blog", ru: "Блог", en: "Blog" },
    faq: { uz: "Savol-javob", ru: "Вопрос-ответ", en: "FAQ" },
    vacancies: { uz: "Vakansiyalar", ru: "Вакансии", en: "Careers" },
    contact: { uz: "Aloqa", ru: "Контакты", en: "Contact" },
    advantages: { uz: "Afzalliklar", ru: "Преимущества", en: "Advantages" },
    experts: { uz: "Mutaxassislar", ru: "Эксперты", en: "Experts" },
  };
  return titles[key]?.[lang] || titles[key]?.uz || key;
}

// ---- admin sub-router -------------------------------------------------

async function handleAdmin(req, res, pathname, url) {
  let m;

  if (pathname === "/admin" && req.method === "GET") {
    return sendHtml(res, 200, dashboardPage()), true;
  }

  // Services
  if (pathname === "/admin/services" && req.method === "GET") return sendHtml(res, 200, SvcAdmin.listServicesPage()), true;
  if (pathname === "/admin/services/new" && req.method === "GET") return sendHtml(res, 200, SvcAdmin.serviceFormPage()), true;
  if (pathname === "/admin/services/new" && req.method === "POST") {
    await SvcAdmin.createService(await parseForm(req));
    return redirect(res, "/admin/services"), true;
  }
  if ((m = matchPath("/admin/services/:id/edit", pathname))) {
    if (req.method === "GET") {
      const service = SvcAdmin.getService(m.id);
      if (!service) return false;
      return sendHtml(res, 200, SvcAdmin.serviceFormPage({ service })), true;
    }
    if (req.method === "POST") {
      await SvcAdmin.updateService(m.id, await parseForm(req));
      return redirect(res, "/admin/services"), true;
    }
  }
  if ((m = matchPath("/admin/services/:id/delete", pathname)) && req.method === "POST") {
    await SvcAdmin.deleteService(m.id);
    return redirect(res, "/admin/services"), true;
  }

  // Projects
  if (pathname === "/admin/projects" && req.method === "GET") return sendHtml(res, 200, ProjAdmin.listProjectsPage()), true;
  if (pathname === "/admin/projects/new" && req.method === "GET") return sendHtml(res, 200, ProjAdmin.projectFormPage()), true;
  if (pathname === "/admin/projects/new" && req.method === "POST") {
    await ProjAdmin.createProject(await parseForm(req));
    return redirect(res, "/admin/projects"), true;
  }
  if ((m = matchPath("/admin/projects/:id/edit", pathname))) {
    if (req.method === "GET") {
      const project = ProjAdmin.getProject(m.id);
      if (!project) return false;
      return sendHtml(res, 200, ProjAdmin.projectFormPage({ project })), true;
    }
    if (req.method === "POST") {
      await ProjAdmin.updateProject(m.id, await parseForm(req));
      return redirect(res, "/admin/projects"), true;
    }
  }
  if ((m = matchPath("/admin/projects/:id/delete", pathname)) && req.method === "POST") {
    await ProjAdmin.deleteProject(m.id);
    return redirect(res, "/admin/projects"), true;
  }

  // Blog
  if (pathname === "/admin/blog" && req.method === "GET") return sendHtml(res, 200, BlogAdmin.listBlogPage()), true;
  if (pathname === "/admin/blog/new" && req.method === "GET") return sendHtml(res, 200, BlogAdmin.blogFormPage()), true;
  if (pathname === "/admin/blog/new" && req.method === "POST") {
    await BlogAdmin.createPost(await parseForm(req));
    return redirect(res, "/admin/blog"), true;
  }
  if ((m = matchPath("/admin/blog/:id/edit", pathname))) {
    if (req.method === "GET") {
      const post = BlogAdmin.getPost(m.id);
      if (!post) return false;
      return sendHtml(res, 200, BlogAdmin.blogFormPage({ post })), true;
    }
    if (req.method === "POST") {
      await BlogAdmin.updatePost(m.id, await parseForm(req));
      return redirect(res, "/admin/blog"), true;
    }
  }
  if ((m = matchPath("/admin/blog/:id/delete", pathname)) && req.method === "POST") {
    await BlogAdmin.deletePost(m.id);
    return redirect(res, "/admin/blog"), true;
  }

  // FAQ
  if (pathname === "/admin/faq" && req.method === "GET") return sendHtml(res, 200, FaqAdmin.listFaqPage()), true;
  if (pathname === "/admin/faq/new" && req.method === "GET") return sendHtml(res, 200, FaqAdmin.faqFormPage()), true;
  if (pathname === "/admin/faq/new" && req.method === "POST") {
    await FaqAdmin.createFaq(await parseForm(req));
    return redirect(res, "/admin/faq"), true;
  }
  if ((m = matchPath("/admin/faq/:id/edit", pathname))) {
    if (req.method === "GET") {
      const faq = FaqAdmin.getFaq(m.id);
      if (!faq) return false;
      return sendHtml(res, 200, FaqAdmin.faqFormPage({ faq })), true;
    }
    if (req.method === "POST") {
      await FaqAdmin.updateFaq(m.id, await parseForm(req));
      return redirect(res, "/admin/faq"), true;
    }
  }
  if ((m = matchPath("/admin/faq/:id/delete", pathname)) && req.method === "POST") {
    await FaqAdmin.deleteFaq(m.id);
    return redirect(res, "/admin/faq"), true;
  }

  // Vacancies
  if (pathname === "/admin/vacancies" && req.method === "GET") return sendHtml(res, 200, VacAdmin.listVacanciesPage()), true;
  if (pathname === "/admin/vacancies/new" && req.method === "GET") return sendHtml(res, 200, VacAdmin.vacancyFormPage()), true;
  if (pathname === "/admin/vacancies/new" && req.method === "POST") {
    await VacAdmin.createVacancy(await parseForm(req));
    return redirect(res, "/admin/vacancies"), true;
  }
  if ((m = matchPath("/admin/vacancies/:id/edit", pathname))) {
    if (req.method === "GET") {
      const vacancy = VacAdmin.getVacancy(m.id);
      if (!vacancy) return false;
      return sendHtml(res, 200, VacAdmin.vacancyFormPage({ vacancy })), true;
    }
    if (req.method === "POST") {
      await VacAdmin.updateVacancy(m.id, await parseForm(req));
      return redirect(res, "/admin/vacancies"), true;
    }
  }
  if ((m = matchPath("/admin/vacancies/:id/delete", pathname)) && req.method === "POST") {
    await VacAdmin.deleteVacancy(m.id);
    return redirect(res, "/admin/vacancies"), true;
  }

  // Experts
  if (pathname === "/admin/experts" && req.method === "GET") return sendHtml(res, 200, ExpAdmin.listExpertsPage()), true;
  if (pathname === "/admin/experts/new" && req.method === "GET") return sendHtml(res, 200, ExpAdmin.expertFormPage()), true;
  if (pathname === "/admin/experts/new" && req.method === "POST") {
    await ExpAdmin.createExpert(await parseForm(req));
    return redirect(res, "/admin/experts"), true;
  }
  if ((m = matchPath("/admin/experts/:id/edit", pathname))) {
    if (req.method === "GET") {
      const expert = ExpAdmin.getExpert(m.id);
      if (!expert) return false;
      return sendHtml(res, 200, ExpAdmin.expertFormPage({ expert })), true;
    }
    if (req.method === "POST") {
      await ExpAdmin.updateExpert(m.id, await parseForm(req));
      return redirect(res, "/admin/experts"), true;
    }
  }
  if ((m = matchPath("/admin/experts/:id/delete", pathname)) && req.method === "POST") {
    await ExpAdmin.deleteExpert(m.id);
    return redirect(res, "/admin/experts"), true;
  }

  // Messages / leads / applications
  if (pathname === "/admin/messages" && req.method === "GET") return sendHtml(res, 200, MsgAdmin.listMessagesPage()), true;
  if ((m = matchPath("/admin/messages/:collection/:id/delete", pathname)) && req.method === "POST") {
    await MsgAdmin.deleteMessageItem(m.collection, m.id);
    return redirect(res, "/admin/messages"), true;
  }

  // Settings
  if (pathname === "/admin/settings" && req.method === "GET") return sendHtml(res, 200, SettingsAdmin.settingsPage()), true;
  if (pathname === "/admin/settings" && req.method === "POST") {
    await SettingsAdmin.updateSettings(await parseForm(req));
    return redirect(res, "/admin/settings"), true;
  }
  if (pathname === "/admin/settings/password" && req.method === "POST") {
    const result = await SettingsAdmin.changePassword(await parseForm(req));
    if (!result.ok) {
      return sendHtml(res, 400, SettingsAdmin.settingsPage({ flash: { type: "error", message: result.error } })), true;
    }
    return sendHtml(res, 200, SettingsAdmin.settingsPage({ flash: { type: "success", message: "Parol yangilandi." } })), true;
  }

  return false;
}

// ---- boot -------------------------------------------------------------

await loadDb();

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server xatosi");
    }
  });
});

server.listen(PORT, () => {
  console.log(`INNOTEK INVEST sayti ishga tushdi: http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin/login`);
});
