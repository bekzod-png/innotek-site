import { t, pick, esc, breadcrumb } from "../lib/render.js";
import { listAll } from "../lib/db.js";

export function renderExpertsPage(lang) {
  const experts = listAll("experts");
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "experts_title"))}</h1>
      <p>${esc(t(lang, "experts_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_experts") }])}
  <section class="block">
    <div class="container">
      <div class="grid-3">
        ${experts
          .map(
            (e) => `
          <div class="card">
            <div class="card-body" style="align-items:center;text-align:center">
              <div class="avatar" style="width:64px;height:64px;font-size:1.4rem;margin-bottom:6px">${esc(e.name.slice(0, 1))}</div>
              <h3 style="margin-bottom:0">${esc(e.name)}</h3>
              <span class="tag">${esc(pick(e.role, lang))}</span>
              <p style="color:var(--color-muted)">${esc(pick(e.bio, lang))}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>
  <section class="block alt">
    <div class="container">
      <div class="cta-band">
        <div><h2>${esc(t(lang, "vacancies_title"))}</h2><p>${esc(t(lang, "vacancies_subtitle"))}</p></div>
        <a class="btn btn-primary" href="/vacancies?lang=${lang}">${esc(t(lang, "nav_vacancies"))}</a>
      </div>
    </div>
  </section>
  `;
}
