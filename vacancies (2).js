import { t, pick, esc, breadcrumb } from "../lib/render.js";
import { listAll, findBySlug } from "../lib/db.js";

export function renderVacanciesList(lang) {
  const vacancies = listAll("vacancies").filter((v) => v.active);
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "vacancies_title"))}</h1>
      <p>${esc(t(lang, "vacancies_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_vacancies") }])}
  <section class="block">
    <div class="container">
      ${
        vacancies.length
          ? `<div class="grid-2">
        ${vacancies
          .map(
            (v) => `
          <div class="card">
            <div class="card-body">
              <span class="tag">${esc(pick(v.type, lang))}</span>
              <h3>${esc(pick(v.title, lang))}</h3>
              <p style="color:var(--color-muted);font-size:.86rem">${esc(pick(v.location, lang))}</p>
              <p>${esc(pick(v.description, lang))}</p>
              <div class="card-foot"><a class="btn btn-dark btn-sm" href="/vacancies/${esc(v.slug)}?lang=${lang}">${esc(t(lang, "cta_apply"))}</a></div>
            </div>
          </div>`
          )
          .join("")}
      </div>`
          : `<p>${esc(t(lang, "empty_vacancies"))}</p>`
      }
    </div>
  </section>
  `;
}

export function renderVacancyDetail(lang, slug, { success } = {}) {
  const vacancy = findBySlug("vacancies", slug);
  if (!vacancy) return null;
  return `
  ${breadcrumb(lang, [{ label: t(lang, "nav_vacancies"), href: `/vacancies?lang=${lang}` }, { label: pick(vacancy.title, lang) }])}
  <section class="block">
    <div class="container detail-body">
      <div class="meta-row"><span>${esc(pick(vacancy.location, lang))}</span><span>${esc(pick(vacancy.type, lang))}</span></div>
      <h1>${esc(pick(vacancy.title, lang))}</h1>
      <p>${esc(pick(vacancy.description, lang))}</p>
      <h3>${lang === "ru" ? "Требования" : lang === "en" ? "Requirements" : "Talablar"}</h3>
      <p>${esc(pick(vacancy.requirements, lang))}</p>

      <div class="admin-card" style="margin-top:30px">
        <h3>${esc(t(lang, "apply_title"))}</h3>
        ${success ? `<div class="alert alert-success">${esc(t(lang, "success_vacancy"))}</div>` : ""}
        <form method="post" action="/vacancies/${esc(vacancy.slug)}?lang=${lang}">
          <div class="form-grid">
            <div class="field"><label>${esc(t(lang, "form_name"))}</label><input type="text" name="name" required></div>
            <div class="field"><label>${esc(t(lang, "form_phone"))}</label><input type="tel" name="phone" required placeholder="+998 90 123 45 67"></div>
            <div class="field full"><label>${esc(t(lang, "form_email"))}</label><input type="email" name="email"></div>
            <div class="field full"><label>${esc(t(lang, "cv_note"))}</label><textarea name="message"></textarea></div>
          </div>
          <button class="btn btn-primary" type="submit">${esc(t(lang, "cta_apply"))}</button>
        </form>
      </div>
    </div>
  </section>
  `;
}
