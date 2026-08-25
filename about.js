import { t, esc, breadcrumb, sectionHeading } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { getDb } from "../lib/db.js";

const ABOUT_TEXT = {
  uz: [
    "INNOTEK INVEST — loyihalash, qurilish-montaj va muhandislik xizmatlarini bir joydan taqdim etadigan kompaniya. Biz turar-joy, tijorat va sanoat obyektlari uchun to'liq tsikl bo'yicha ishlaymiz: o'lchashdan tortib obyektni kafolat bilan topshirishgacha.",
    "Jamoamiz malakali arxitektorlar, konstruktorlar va muhandislardan iborat bo'lib, har bir loyihada zamonaviy dasturiy ta'minot va sifat standartlariga rioya qilamiz.",
    "Bizning maqsadimiz — mijozlarimizga ishonchli, shaffof va o'z vaqtida bajariladigan xizmat ko'rsatish.",
  ],
  ru: [
    "INNOTEK INVEST — компания, предоставляющая услуги проектирования, строительно-монтажных работ и инженерии в одном месте. Мы работаем полным циклом для жилых, коммерческих и промышленных объектов: от замера до сдачи объекта с гарантией.",
    "Наша команда состоит из квалифицированных архитекторов, конструкторов и инженеров, использующих современное программное обеспечение и соблюдающих стандарты качества на каждом проекте.",
    "Наша цель — предоставлять клиентам надёжный, прозрачный и своевременный сервис.",
  ],
  en: [
    "INNOTEK INVEST is a company providing design, construction and engineering services under one roof. We work full-cycle on residential, commercial and industrial facilities — from site survey to handover with a warranty.",
    "Our team consists of qualified architects, structural engineers and engineers who use modern software and follow quality standards on every project.",
    "Our goal is to provide clients with reliable, transparent and timely service.",
  ],
};

export function renderAboutPage(lang) {
  const s = getDb().settings;
  const paras = ABOUT_TEXT[lang] || ABOUT_TEXT.uz;
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "about_title"))}</h1>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_about") }])}
  <section class="block">
    <div class="container detail-body">
      ${paras.map((p) => `<p>${esc(p)}</p>`).join("")}
    </div>
  </section>
  <div class="stats-bar">
    <div class="container stats-grid">
      <div class="stat"><b>${esc(s.stats.projects)}</b><span>${esc(t(lang, "stat_projects"))}</span></div>
      <div class="stat"><b>${esc(s.stats.experience)}</b><span>${esc(t(lang, "stat_experience"))}</span></div>
      <div class="stat"><b>${esc(s.stats.specialists)}</b><span>${esc(t(lang, "stat_specialists"))}</span></div>
      <div class="stat"><b>${esc(s.stats.warranty)}</b><span>${esc(t(lang, "stat_warranty"))}</span></div>
    </div>
  </div>
  <section class="block">
    <div class="container">
      ${sectionHeading(t(lang, "process_title"))}
      <div class="process-grid">
        <div class="process-step"><div class="num">${icon("measure", 18)}</div><h3>${esc(t(lang, "process_1_title"))}</h3><p>${esc(t(lang, "process_1_text"))}</p></div>
        <div class="process-step"><div class="num">${icon("blueprint", 18)}</div><h3>${esc(t(lang, "process_2_title"))}</h3><p>${esc(t(lang, "process_2_text"))}</p></div>
        <div class="process-step"><div class="num">${icon("crane", 18)}</div><h3>${esc(t(lang, "process_3_title"))}</h3><p>${esc(t(lang, "process_3_text"))}</p></div>
        <div class="process-step"><div class="num">${icon("check", 18)}</div><h3>${esc(t(lang, "process_4_title"))}</h3><p>${esc(t(lang, "process_4_text"))}</p></div>
      </div>
    </div>
  </section>
  <section class="block alt">
    <div class="container">
      <div class="cta-band">
        <div><h2>${esc(t(lang, "contact_title"))}</h2><p>${esc(t(lang, "contact_subtitle"))}</p></div>
        <a class="btn btn-primary" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  `;
}
