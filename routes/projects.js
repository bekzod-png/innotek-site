import { t, pick, sectionHeading, esc, breadcrumb } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { listAll, findBySlug } from "../lib/db.js";

const CATEGORY_LABEL = {
  residential: { uz: "Turar-joy", ru: "Жилое", en: "Residential" },
  commercial: { uz: "Tijorat", ru: "Коммерческое", en: "Commercial" },
  renovation: { uz: "Rekonstruksiya", ru: "Реконструкция", en: "Renovation" },
  industrial: { uz: "Sanoat", ru: "Промышленное", en: "Industrial" },
};

export function renderProjectsList(lang, category) {
  let projects = listAll("projects");
  if (category) projects = projects.filter((p) => p.category === category);
  const categories = Object.keys(CATEGORY_LABEL);
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "projects_title"))}</h1>
      <p>${esc(t(lang, "projects_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_projects") }])}
  <section class="block">
    <div class="container">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px">
        <a class="btn btn-sm ${!category ? "btn-dark" : "btn-outline"}" style="${!category ? "" : "color:var(--color-ink);border-color:var(--color-line)"}" href="/projects?lang=${lang}">${lang === "ru" ? "Все" : lang === "en" ? "All" : "Barchasi"}</a>
        ${categories
          .map(
            (c) =>
              `<a class="btn btn-sm ${category === c ? "btn-dark" : "btn-outline"}" style="${category === c ? "" : "color:var(--color-ink);border-color:var(--color-line)"}" href="/projects?category=${c}&lang=${lang}">${esc(pick(CATEGORY_LABEL[c], lang))}</a>`
          )
          .join("")}
      </div>
      ${
        projects.length
          ? `<div class="grid-3">
        ${projects
          .map(
            (p) => `
          <a class="card" href="/projects/${esc(p.slug)}?lang=${lang}" style="color:inherit">
            <div class="card-media">${icon("build", 40)}</div>
            <div class="card-body">
              <span class="tag">${esc(pick(p.location, lang))} &middot; ${p.year}</span>
              <h3>${esc(pick(p.title, lang))}</h3>
              <p>${esc(pick(p.summary, lang))}</p>
            </div>
          </a>`
          )
          .join("")}
      </div>`
          : `<p>${esc(t(lang, "empty_projects"))}</p>`
      }
    </div>
  </section>
  `;
}

export function renderProjectDetail(lang, slug) {
  const project = findBySlug("projects", slug);
  if (!project) return null;
  const others = listAll("projects").filter((p) => p.slug !== slug).slice(0, 3);
  return `
  ${breadcrumb(lang, [{ label: t(lang, "nav_projects"), href: `/projects?lang=${lang}` }, { label: pick(project.title, lang) }])}
  <section class="block">
    <div class="container">
      <div class="detail-media">${icon("build", 60)}</div>
      <div class="detail-body">
        <div class="meta-row">
          <span><b>${esc(pick(CATEGORY_LABEL[project.category] || {}, lang))}</b></span>
          <span>${esc(pick(project.location, lang))}</span>
          <span>${project.year}</span>
        </div>
        <h1>${esc(pick(project.title, lang))}</h1>
        <div>${pick(project.description, lang).split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("")}</div>
        <a class="btn btn-primary" href="/contact?lang=${lang}" style="margin-top:14px">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "projects_title"))}
      <div class="grid-3">
        ${others
          .map(
            (p) => `
          <a class="card" href="/projects/${esc(p.slug)}?lang=${lang}" style="color:inherit">
            <div class="card-media">${icon("build", 34)}</div>
            <div class="card-body">
              <span class="tag">${p.year}</span>
              <h3>${esc(pick(p.title, lang))}</h3>
            </div>
          </a>`
          )
          .join("")}
      </div>
    </div>
  </section>
  `;
}
