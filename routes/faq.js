import { t, pick, esc, breadcrumb } from "../lib/render.js";
import { listAll } from "../lib/db.js";

export function renderFaqPage(lang) {
  const faqs = listAll("faq");
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "faq_title"))}</h1>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_faq") }])}
  <section class="block">
    <div class="container">
      <div class="faq-list">
        ${faqs
          .map(
            (f) => `
          <details class="faq-item">
            <summary>${esc(pick(f.question, lang))}</summary>
            <div class="faq-answer">${esc(pick(f.answer, lang))}</div>
          </details>`
          )
          .join("")}
      </div>
      <div class="cta-band" style="margin-top:40px">
        <div><h2>${esc(t(lang, "contact_title"))}</h2><p>${esc(t(lang, "contact_subtitle"))}</p></div>
        <a class="btn btn-primary" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  `;
}
