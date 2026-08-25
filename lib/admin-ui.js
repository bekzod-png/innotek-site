import { esc } from "./render.js";

const NAV = [
  { href: "/admin", label: "Boshqaruv paneli", icon: "⌂" },
  { href: "/admin/services", label: "Xizmatlar" },
  { href: "/admin/products", label: "Mahsulotlar" },
  { href: "/admin/projects", label: "Loyihalar" },
  { href: "/admin/experts", label: "Mutaxassislar" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/faq", label: "Savol-javob" },
  { href: "/admin/vacancies", label: "Vakansiyalar" },
  { href: "/admin/messages", label: "Murojaatlar" },
  { href: "/admin/settings", label: "Sozlamalar" },
];

export function adminLayout({ activePath, title, body, flash }) {
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — Admin | INNOTEK INVEST</title>
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="/styles.css">
</head>
<body class="admin-body">
<div class="admin-shell">
  <aside class="admin-sidebar">
    <a href="/" class="brand" style="margin-bottom:6px">
      <span class="brand-mark">IT</span>
      <span class="brand-text"><strong>INNOTEK</strong></span>
    </a>
    <nav>
      ${NAV.map((n) => `<a href="${n.href}" class="${activePath === n.href ? "active" : ""}">${esc(n.label)}</a>`).join("")}
      <form method="post" action="/admin/logout" style="margin-top:16px">
        <button class="btn btn-outline btn-sm btn-block" type="submit" style="color:#fff;border-color:rgba(255,255,255,.3)">Chiqish</button>
      </form>
    </nav>
  </aside>
  <div class="admin-main">
    <div class="admin-topbar">
      <h1 style="margin:0;font-size:1.5rem">${esc(title)}</h1>
      <a class="btn btn-dark btn-sm" href="/" target="_blank">Saytni ko'rish &rarr;</a>
    </div>
    ${flash ? `<div class="alert alert-${flash.type === "error" ? "error" : "success"}">${esc(flash.message)}</div>` : ""}
    ${body}
  </div>
</div>
</body>
</html>`;
}

export function loginPage({ error } = {}) {
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin kirish — INNOTEK INVEST</title>
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="login-wrap">
  <div class="login-card">
    <div class="brand" style="margin-bottom:22px">
      <span class="brand-mark">IT</span>
      <span class="brand-text"><strong>INNOTEK INVEST</strong><small>Admin panel</small></span>
    </div>
    ${error ? `<div class="alert alert-error">${esc(error)}</div>` : ""}
    <form method="post" action="/admin/login">
      <div class="field">
        <label>Parol</label>
        <input type="password" name="password" required autofocus>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Kirish</button>
    </form>
  </div>
</div>
</body>
</html>`;
}

// A field group with 3 language tabs (uz/ru/en), used across every admin content form.
export function langFieldGroup({ id, label, name, value = { uz: "", ru: "", en: "" }, textarea = false, required = false }) {
  const langs = [
    { code: "uz", label: "UZ" },
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
  ];
  const tag = textarea ? "textarea" : "input";
  return `<div class="field full">
    <label>${esc(label)}</label>
    <div class="lang-tabs" data-lang-tabs="${id}">
      ${langs.map((l, i) => `<button type="button" class="lang-tab-btn ${i === 0 ? "active" : ""}" data-lang="${l.code}">${l.label}</button>`).join("")}
    </div>
    ${langs
      .map(
        (l, i) => `<div class="lang-tab-panel ${i === 0 ? "active" : ""}" data-lang-panel="${id}" data-lang="${l.code}">
        ${
          textarea
            ? `<textarea name="${name}_${l.code}" ${required && l.code === "uz" ? "required" : ""}>${esc(value[l.code] || "")}</textarea>`
            : `<input type="text" name="${name}_${l.code}" value="${esc(value[l.code] || "")}" ${required && l.code === "uz" ? "required" : ""}>`
        }
      </div>`
      )
      .join("")}
  </div>`;
}

export function collectLangField(form, name) {
  return { uz: (form.get(`${name}_uz`) || "").trim(), ru: (form.get(`${name}_ru`) || "").trim(), en: (form.get(`${name}_en`) || "").trim() };
}

export function table({ headers, rows }) {
  return `<table class="admin-table">
    <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>`;
}
