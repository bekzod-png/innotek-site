import { t, pick, sectionHeading, esc, breadcrumb, money } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { listAll, findBySlug } from "../lib/db.js";

export function renderServicesList(lang) {
  const services = listAll("services");
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "services_title"))}</h1>
      <p>${esc(t(lang, "services_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_services") }])}
  <section class="block">
    <div class="container">
      <div class="grid-3">
        ${services
          .map(
            (s) => `
          <div class="card">
            <div class="card-body">
              <div class="card-icon">${icon(s.icon)}</div>
              <h3><a href="/services/${esc(s.slug)}?lang=${lang}" style="color:inherit">${esc(pick(s.title, lang))}</a></h3>
              <p>${esc(pick(s.summary, lang))}</p>
              ${s.priceFrom ? `<p class="price">${lang === "ru" ? "от" : lang === "en" ? "from" : "dan"} ${money(s.priceFrom)} UZS</p>` : ""}
              <div class="card-foot"><a href="/services/${esc(s.slug)}?lang=${lang}">${esc(t(lang, "cta_more"))} &rarr;</a></div>
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
        <div><h2>${esc(t(lang, "calc_title"))}</h2><p>${esc(t(lang, "calc_subtitle"))}</p></div>
        <a class="btn btn-primary" href="/calculator?lang=${lang}">${esc(t(lang, "cta_calc"))}</a>
      </div>
    </div>
  </section>
  `;
}

export function renderServiceDetail(lang, slug) {
  const service = findBySlug("services", slug);
  if (!service) return null;
  const others = listAll("services").filter((s) => s.slug !== slug).slice(0, 3);
  return `
  ${breadcrumb(lang, [{ label: t(lang, "nav_services"), href: `/services?lang=${lang}` }, { label: pick(service.title, lang) }])}
  <section class="block">
    <div class="container detail-body">
      <div class="card-icon" style="margin-bottom:16px">${icon(service.icon, 30)}</div>
      <h1>${esc(pick(service.title, lang))}</h1>
      ${service.priceFrom ? `<p class="price" style="font-size:1.1rem">${lang === "ru" ? "Narxi" : lang === "en" ? "Price" : "Narxi"}: ${lang === "ru" ? "от" : lang === "en" ? "from" : "dan"} ${money(service.priceFrom)} UZS</p>` : ""}
      <div>${pick(service.description, lang).split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
        <a class="btn btn-primary" href="/calculator?lang=${lang}">${esc(t(lang, "cta_calc"))}</a>
        <a class="btn btn-dark" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "services_title"))}
      <div class="grid-3">
        ${others
          .map(
            (s) => `
          <div class="card">
            <div class="card-body">
              <div class="card-icon">${icon(s.icon)}</div>
              <h3><a href="/services/${esc(s.slug)}?lang=${lang}" style="color:inherit">${esc(pick(s.title, lang))}</a></h3>
              <p>${esc(pick(s.summary, lang))}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>
  `;
}
