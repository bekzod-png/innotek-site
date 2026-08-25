import { t, LANGS, pick } from "./i18n.js";
import { getDb } from "./db.js";

export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Turn plain-text with blank lines into safe <p> paragraphs (for admin-authored content).
export function paragraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function langSwitcher(lang, currentPath) {
  return `<div class="lang-switch">
    ${LANGS.map(
      (l) =>
        `<a href="${esc(currentPath)}?lang=${l}" class="${l === lang ? "active" : ""}" hreflang="${l}">${l.toUpperCase()}</a>`
    ).join("")}
  </div>`;
}

function navLink(href, label, activePath) {
  const isActive = activePath === href || (href !== "/" && activePath.startsWith(href));
  return `<a href="${esc(href)}" class="${isActive ? "active" : ""}">${esc(label)}</a>`;
}

export function header(lang, activePath) {
  const db = getDb();
  const s = db.settings;
  return `
  <header class="site-header">
    <div class="container header-inner">
      <a href="/?lang=${lang}" class="brand">
        <span class="brand-mark" aria-hidden="true">IT</span>
        <span class="brand-text">
          <strong>${esc(t(lang, "site_name"))}</strong>
          <small>${esc(t(lang, "site_tagline"))}</small>
        </span>
      </a>
      <nav class="main-nav" id="main-nav">
        ${navLink("/services", t(lang, "nav_services"), activePath)}
        ${navLink("/about", t(lang, "nav_about"), activePath)}
        ${navLink("/advantages", t(lang, "nav_advantages"), activePath)}
        ${navLink("/projects", t(lang, "nav_projects"), activePath)}
        ${navLink("/blog", t(lang, "nav_blog"), activePath)}
        ${navLink("/experts", t(lang, "nav_experts"), activePath)}
        ${navLink("/vacancies", t(lang, "nav_vacancies"), activePath)}
        ${navLink("/contact", t(lang, "nav_contact"), activePath)}
      </nav>
      <div class="header-actions">
        ${langSwitcher(lang, activePath)}
        <a class="phone-link" href="tel:${esc(s.phonePrimary.replace(/\s+/g, ""))}">${esc(s.phonePrimary)}</a>
        <a class="btn btn-primary btn-sm" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;
}

export function footer(lang) {
  const db = getDb();
  const s = db.settings;
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-col footer-about">
        <a href="/?lang=${lang}" class="brand">
          <span class="brand-mark" aria-hidden="true">IT</span>
          <span class="brand-text"><strong>${esc(t(lang, "site_name"))}</strong></span>
        </a>
        <p>${esc(t(lang, "site_tagline"))}</p>
        <div class="socials">
          <a href="${esc(s.telegram)}" aria-label="Telegram" target="_blank" rel="noopener">Telegram</a>
          <a href="${esc(s.instagram)}" aria-label="Instagram" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>${esc(t(lang, "footer_nav_title"))}</h4>
        <a href="/services?lang=${lang}">${esc(t(lang, "nav_services"))}</a>
        <a href="/advantages?lang=${lang}">${esc(t(lang, "nav_advantages"))}</a>
        <a href="/projects?lang=${lang}">${esc(t(lang, "nav_projects"))}</a>
        <a href="/calculator?lang=${lang}">${esc(t(lang, "nav_calculator"))}</a>
        <a href="/experts?lang=${lang}">${esc(t(lang, "nav_experts"))}</a>
        <a href="/blog?lang=${lang}">${esc(t(lang, "nav_blog"))}</a>
        <a href="/vacancies?lang=${lang}">${esc(t(lang, "nav_vacancies"))}</a>
        <a href="/faq?lang=${lang}">${esc(t(lang, "nav_faq"))}</a>
      </div>
      <div class="footer-col">
        <h4>${esc(t(lang, "footer_contact_title"))}</h4>
        <p><span>${esc(t(lang, "footer_address_label"))}:</span> ${esc(s.address)}</p>
        <p><span>${esc(t(lang, "footer_phone_label"))}:</span> <a href="tel:${esc(s.phonePrimary.replace(/\s+/g, ""))}">${esc(s.phonePrimary)}</a></p>
        <p><span>${esc(t(lang, "footer_email_label"))}:</span> <a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${esc(t(lang, "site_name"))}. ${esc(t(lang, "footer_rights"))}</p>
      <a href="/admin" class="admin-link">${esc(t(lang, "nav_admin"))}</a>
    </div>
  </footer>`;
}

export function layout({ lang, path: activePath, title, description, body, bodyClass = "" }) {
  const db = getDb();
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(t(lang, "site_name"))}</title>
<meta name="description" content="${esc(description || t(lang, "hero_subtitle"))}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="%23145c46"/><text x="16" y="22" font-size="14" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle">IT</text></svg>')}">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="${esc(bodyClass)}">
${header(lang, activePath)}
<main>
${body}
</main>
${footer(lang)}
<script src="/script.js" defer></script>
</body>
</html>`;
}

export function breadcrumb(lang, items) {
  // items: [{label, href}], last item has no href
  return `<div class="breadcrumb container">
    <a href="/?lang=${lang}">${esc(t(lang, "nav_home"))}</a>
    ${items
      .map((it) => (it.href ? ` <span>/</span> <a href="${esc(it.href)}">${esc(it.label)}</a>` : ` <span>/</span> <span class="current">${esc(it.label)}</span>`))
      .join("")}
  </div>`;
}

export function sectionHeading(title, subtitle) {
  return `<div class="section-heading">
    <h2>${esc(title)}</h2>
    ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
  </div>`;
}

export function money(n) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(n));
}

export { t, pick };
