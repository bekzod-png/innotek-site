import { t, pick, sectionHeading, esc } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { listAll, getDb } from "../lib/db.js";

export function renderHome(lang) {
  const services = listAll("services").slice(0, 6);
  const products = listAll("products").slice(0, 3);
  const projects = listAll("projects").slice(0, 3);
  const testimonials = listAll("testimonials");
  const blog = listAll("blog").slice(0, 3);
  const clients = listAll("clients");
  const stats = getDb().settings.stats;

  return `
  <section class="hero">
    <div class="container hero-inner">
      <div>
        <span class="hero-eyebrow">${esc(t(lang, "site_name"))}</span>
        <h1>${esc(t(lang, "hero_title"))}</h1>
        <p class="lead">${esc(t(lang, "hero_subtitle"))}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/calculator?lang=${lang}">${esc(t(lang, "cta_calc"))}</a>
          <a class="btn btn-outline" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
        </div>
      </div>
      <div class="hero-art">
        ${processMini(lang)}
      </div>
    </div>
  </section>

  <div class="stats-bar">
    <div class="container stats-grid">
      <div class="stat"><b>${esc(stats.projects)}</b><span>${esc(t(lang, "stat_projects"))}</span></div>
      <div class="stat"><b>${esc(stats.experience)}</b><span>${esc(t(lang, "stat_experience"))}</span></div>
      <div class="stat"><b>${esc(stats.specialists)}</b><span>${esc(t(lang, "stat_specialists"))}</span></div>
      <div class="stat"><b>${esc(stats.warranty)}</b><span>${esc(t(lang, "stat_warranty"))}</span></div>
    </div>
  </div>

  <section class="block">
    <div class="container">
      ${sectionHeading(t(lang, "process_title"))}
      <div class="process-grid">
        <div class="process-step"><div class="num">1</div><h3>${esc(t(lang, "process_1_title"))}</h3><p>${esc(t(lang, "process_1_text"))}</p></div>
        <div class="process-step"><div class="num">2</div><h3>${esc(t(lang, "process_2_title"))}</h3><p>${esc(t(lang, "process_2_text"))}</p></div>
        <div class="process-step"><div class="num">3</div><h3>${esc(t(lang, "process_3_title"))}</h3><p>${esc(t(lang, "process_3_text"))}</p></div>
        <div class="process-step"><div class="num">4</div><h3>${esc(t(lang, "process_4_title"))}</h3><p>${esc(t(lang, "process_4_text"))}</p></div>
      </div>
    </div>
  </section>

  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "services_title"), t(lang, "services_subtitle"))}
      <div class="grid-3">
        ${services
          .map(
            (s) => `
          <div class="card">
            <div class="card-body">
              <div class="card-icon">${icon(s.icon)}</div>
              <h3><a href="/services/${esc(s.slug)}?lang=${lang}" style="color:inherit">${esc(pick(s.title, lang))}</a></h3>
              <p>${esc(pick(s.summary, lang))}</p>
              <div class="card-foot"><a href="/services/${esc(s.slug)}?lang=${lang}">${esc(t(lang, "cta_more"))} &rarr;</a></div>
            </div>
          </div>`
          )
          .join("")}
      </div>
      <p style="text-align:center;margin-top:34px"><a class="btn btn-dark" href="/services?lang=${lang}">${esc(t(lang, "cta_all_services"))}</a></p>
    </div>
  </section>

  <section class="block">
    <div class="container">
      ${sectionHeading(t(lang, "products_title"), t(lang, "products_subtitle"))}
      <div class="grid-3">
        ${products
          .map(
            (p) => `
          <div class="card">
            <div class="card-media">${icon(p.icon, 40)}</div>
            <div class="card-body">
              <h3><a href="/products/${esc(p.slug)}?lang=${lang}" style="color:inherit">${esc(pick(p.title, lang))}</a></h3>
              <p>${esc(pick(p.summary, lang))}</p>
              <div class="card-foot"><a href="/products/${esc(p.slug)}?lang=${lang}">${esc(t(lang, "cta_more"))} &rarr;</a></div>
            </div>
          </div>`
          )
          .join("")}
      </div>
      <p style="text-align:center;margin-top:34px"><a class="btn btn-dark" href="/products?lang=${lang}">${esc(t(lang, "cta_all_products"))}</a></p>
    </div>
  </section>

  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "projects_title"), t(lang, "projects_subtitle"))}
      <div class="grid-3">
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
      </div>
      <p style="text-align:center;margin-top:34px"><a class="btn btn-dark" href="/projects?lang=${lang}">${esc(t(lang, "cta_all_projects"))}</a></p>
    </div>
  </section>

  <section class="block">
    <div class="container">
      ${sectionHeading(t(lang, "clients_title"))}
      <div class="clients-strip">
        ${clients.map((c) => `<span class="client-chip">${esc(c.name)}</span>`).join("")}
      </div>
    </div>
  </section>

  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "why_title"))}
      <div class="why-grid">
        ${whyItem(icon("check"), lang === "ru" ? "Полный цикл работ" : lang === "en" ? "Full-cycle service" : "To'liq tsikl xizmat", lang === "ru" ? "От проекта до сдачи объекта — без посредников" : lang === "en" ? "From design to handover — no middlemen" : "Loyihadan obyektni topshirishgacha — vositachilarsiz")}
        ${whyItem(icon("shield"), lang === "ru" ? "Гарантия до 10 лет" : lang === "en" ? "Up to 10-year warranty" : "10 yilgacha kafolat", lang === "ru" ? "На конструктивные решения и качество работ" : lang === "en" ? "On structural solutions and workmanship" : "Konstruktiv yechimlar va ish sifatiga")}
        ${whyItem(icon("measure"), lang === "ru" ? "Точная смета" : lang === "en" ? "Accurate estimate" : "Aniq smeta", lang === "ru" ? "Без скрытых платежей на любом этапе" : lang === "en" ? "No hidden costs at any stage" : "Har qanday bosqichda yashirin to'lovlarsiz")}
        ${whyItem(icon("network"), lang === "ru" ? "Свои инженерные бригады" : lang === "en" ? "In-house engineering crews" : "O'z muhandislik brigadalari", lang === "ru" ? "Полный контроль качества на объекте" : lang === "en" ? "Full quality control on site" : "Obyektda to'liq sifat nazorati")}
        ${whyItem(icon("crane"), lang === "ru" ? "Соблюдение сроков" : lang === "en" ? "On-time delivery" : "Muddatlarga rioya", lang === "ru" ? "Договорные сроки фиксируются в контракте" : lang === "en" ? "Deadlines are fixed in the contract" : "Shartnoma muddatlari qat'iy belgilanadi")}
        ${whyItem(icon("phone"), lang === "ru" ? "Поддержка 24/7" : lang === "en" ? "24/7 support" : "24/7 aloqa", lang === "ru" ? "Всегда на связи по телефону и Telegram" : lang === "en" ? "Always reachable by phone and Telegram" : "Telefon va Telegram orqali doim aloqada")}
      </div>
      <p style="text-align:center;margin-top:30px"><a class="btn btn-dark" href="/advantages?lang=${lang}">${esc(t(lang, "nav_advantages"))} &rarr;</a></p>
    </div>
  </section>

  <section class="block">
    <div class="container">
      ${sectionHeading(t(lang, "testimonials_title"))}
      <div class="grid-3">
        ${testimonials
          .map(
            (te) => `
          <div class="testimonial">
            <p class="quote">&ldquo;${esc(pick(te.text, lang))}&rdquo;</p>
            <div class="who">
              <div class="avatar">${esc(te.author.slice(0, 1))}</div>
              <div><b>${esc(te.author)}</b><span>${esc(pick(te.role, lang))}</span></div>
            </div>
          </div>`
          )
          .join("")}
      </div>
      <p style="text-align:center;margin-top:30px"><a class="btn btn-dark" href="/experts?lang=${lang}">${esc(t(lang, "nav_experts"))} &rarr;</a></p>
    </div>
  </section>

  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "blog_title"), t(lang, "blog_subtitle"))}
      <div class="grid-3">
        ${blog
          .map(
            (b) => `
          <a class="card" href="/blog/${esc(b.slug)}?lang=${lang}" style="color:inherit">
            <div class="card-media">${icon("design", 36)}</div>
            <div class="card-body">
              <span class="tag">${esc(b.date)}</span>
              <h3>${esc(pick(b.title, lang))}</h3>
              <p>${esc(pick(b.excerpt, lang))}</p>
            </div>
          </a>`
          )
          .join("")}
      </div>
    </div>
  </section>

  <section class="block">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>${esc(t(lang, "calc_title"))}</h2>
          <p>${esc(t(lang, "calc_subtitle"))}</p>
        </div>
        <a class="btn btn-primary" href="/calculator?lang=${lang}">${esc(t(lang, "cta_calc"))}</a>
      </div>
    </div>
  </section>
  `;
}

function whyItem(iconSvg, title, text) {
  return `<div class="why-item"><div class="dot">${iconSvg}</div><div><h3 style="margin-bottom:.2em">${title}</h3><p style="margin:0;color:var(--color-muted)">${text}</p></div></div>`;
}

function processMini(lang) {
  return `<div style="display:flex;flex-direction:column;gap:16px">
    ${["process_1_title", "process_2_title", "process_3_title", "process_4_title"]
      .map(
        (k, i) => `<div style="display:flex;align-items:center;gap:12px;color:#fff">
          <span style="width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-weight:800;flex:none">${i + 1}</span>
          <span style="font-weight:600">${esc(t(lang, k))}</span>
        </div>`
      )
      .join("")}
  </div>`;
}

