import { t, esc, breadcrumb } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { getDb } from "../lib/db.js";

export function renderContactPage(lang, { success } = {}) {
  const s = getDb().settings;
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "contact_title"))}</h1>
      <p>${esc(t(lang, "contact_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_contact") }])}
  <section class="block">
    <div class="container contact-grid">
      <div>
        <h3>${esc(t(lang, "contact_form_title"))}</h3>
        ${success ? `<div class="alert alert-success">${esc(t(lang, "success_contact"))}</div>` : ""}
        <form method="post" action="/contact?lang=${lang}">
          <div class="form-grid">
            <div class="field"><label>${esc(t(lang, "form_name"))}</label><input type="text" name="name" required></div>
            <div class="field"><label>${esc(t(lang, "form_phone"))}</label><input type="tel" name="phone" required placeholder="+998 90 123 45 67"></div>
            <div class="field full"><label>${esc(t(lang, "form_email"))}</label><input type="email" name="email"></div>
            <div class="field full"><label>${esc(t(lang, "form_service"))}</label><input type="text" name="service"></div>
            <div class="field full"><label>${esc(t(lang, "form_message"))}</label><textarea name="message" required></textarea></div>
          </div>
          <button class="btn btn-primary" type="submit">${esc(t(lang, "cta_send"))}</button>
        </form>
      </div>
      <div class="contact-info-card">
        <div class="row"><div class="ico">${icon("pin", 18)}</div><div><b>${esc(t(lang, "footer_address_label"))}</b><p style="margin:2px 0 0">${esc(s.address)}</p></div></div>
        <div class="row"><div class="ico">${icon("phone", 18)}</div><div><b>${esc(t(lang, "footer_phone_label"))}</b><p style="margin:2px 0 0"><a href="tel:${esc(s.phonePrimary.replace(/\s+/g, ""))}">${esc(s.phonePrimary)}</a><br><a href="tel:${esc(s.phoneSecondary.replace(/\s+/g, ""))}">${esc(s.phoneSecondary)}</a></p></div></div>
        <div class="row"><div class="ico">${icon("mail", 18)}</div><div><b>${esc(t(lang, "footer_email_label"))}</b><p style="margin:2px 0 0"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p></div></div>
        <div class="map-placeholder">
          <iframe title="map" width="100%" height="100%" style="border:0" loading="lazy"
            src="https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed"></iframe>
        </div>
      </div>
    </div>
  </section>
  `;
}
