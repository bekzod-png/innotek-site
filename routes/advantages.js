import { t, esc, breadcrumb, sectionHeading } from "../lib/render.js";
import { icon } from "../lib/icons.js";

const WHY_ITEMS = {
  uz: [
    ["check", "To'liq tsikl xizmat", "Loyihadan obyektni topshirishgacha — vositachilarsiz"],
    ["shield", "10 yilgacha kafolat", "Konstruktiv yechimlar va ish sifatiga"],
    ["measure", "Aniq smeta", "Har qanday bosqichda yashirin to'lovlarsiz"],
    ["network", "O'z muhandislik brigadalari", "Obyektda to'liq sifat nazorati"],
    ["crane", "Muddatlarga rioya", "Shartnoma muddatlari qat'iy belgilanadi"],
    ["phone", "24/7 aloqa", "Telefon va Telegram orqali doim aloqada"],
    ["blueprint", "Rasmiy shartnoma", "Har bir bosqich hujjatlashtiriladi, yashirin narxlar yo'q"],
    ["design", "Zamonaviy dasturlar", "BIM/CAD asosida aniq loyiha va vizualizatsiya"],
  ],
  ru: [
    ["check", "Полный цикл работ", "От проекта до сдачи объекта — без посредников"],
    ["shield", "Гарантия до 10 лет", "На конструктивные решения и качество работ"],
    ["measure", "Точная смета", "Без скрытых платежей на любом этапе"],
    ["network", "Свои инженерные бригады", "Полный контроль качества на объекте"],
    ["crane", "Соблюдение сроков", "Договорные сроки фиксируются в контракте"],
    ["phone", "Поддержка 24/7", "Всегда на связи по телефону и Telegram"],
    ["blueprint", "Официальный договор", "Каждый этап документируется, без скрытых цен"],
    ["design", "Современные программы", "Точный проект и визуализация на базе BIM/CAD"],
  ],
  en: [
    ["check", "Full-cycle service", "From design to handover — no middlemen"],
    ["shield", "Up to 10-year warranty", "On structural solutions and workmanship"],
    ["measure", "Accurate estimate", "No hidden costs at any stage"],
    ["network", "In-house engineering crews", "Full quality control on site"],
    ["crane", "On-time delivery", "Deadlines are fixed in the contract"],
    ["phone", "24/7 support", "Always reachable by phone and Telegram"],
    ["blueprint", "Official contract", "Every stage is documented, no hidden pricing"],
    ["design", "Modern software", "Accurate design and visualization using BIM/CAD"],
  ],
};

const COMPARE_ROWS = {
  uz: [
    ["Rasmiy shartnoma va hisobotlar", true, false],
    ["Kafolat (yozma, muddati bilan)", true, false],
    ["Sertifikatlangan materiallar", true, "Ba'zan"],
    ["Muhandis-nazoratchi ishtiroki", true, false],
    ["Soliq hujjatlari (chek, faktura)", true, false],
    ["Muddat kechikkanda javobgarlik", true, false],
  ],
  ru: [
    ["Официальный договор и отчётность", true, false],
    ["Гарантия (письменная, со сроком)", true, false],
    ["Сертифицированные материалы", true, "Иногда"],
    ["Участие инженера технадзора", true, false],
    ["Налоговые документы (чек, счёт-фактура)", true, false],
    ["Ответственность при срыве сроков", true, false],
  ],
  en: [
    ["Official contract and reporting", true, false],
    ["Warranty (written, with a term)", true, false],
    ["Certified materials", true, "Sometimes"],
    ["Supervising engineer on site", true, false],
    ["Tax documents (receipt, invoice)", true, false],
    ["Accountability for missed deadlines", true, false],
  ],
};

export function renderAdvantagesPage(lang) {
  const items = WHY_ITEMS[lang] || WHY_ITEMS.uz;
  const rows = COMPARE_ROWS[lang] || COMPARE_ROWS.uz;
  const cell = (v) => (v === true ? `<span style="color:var(--color-success);font-weight:700">✓</span>` : v === false ? `<span style="color:var(--color-danger);font-weight:700">✕</span>` : esc(v));

  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "advantages_title"))}</h1>
      <p>${esc(t(lang, "advantages_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_advantages") }])}
  <section class="block">
    <div class="container">
      <div class="why-grid">
        ${items
          .map(
            ([ic, title, text]) => `<div class="why-item"><div class="dot">${icon(ic)}</div><div><h3 style="margin-bottom:.2em">${esc(title)}</h3><p style="margin:0;color:var(--color-muted)">${esc(text)}</p></div></div>`
          )
          .join("")}
      </div>
    </div>
  </section>
  <section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "advantages_compare_title"))}
      <div style="max-width:760px;margin:0 auto;overflow-x:auto">
        <table class="admin-table" style="background:#fff;border:1px solid var(--color-line);border-radius:var(--radius-md);overflow:hidden">
          <thead>
            <tr>
              <th></th>
              <th style="text-align:center">${esc(t(lang, "advantages_compare_us"))}</th>
              <th style="text-align:center">${esc(t(lang, "advantages_compare_them"))}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(([label, us, them]) => `<tr><td>${esc(label)}</td><td style="text-align:center">${cell(us)}</td><td style="text-align:center">${cell(them)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section class="block">
    <div class="container">
      <div class="cta-band">
        <div><h2>${esc(t(lang, "contact_title"))}</h2><p>${esc(t(lang, "contact_subtitle"))}</p></div>
        <a class="btn btn-primary" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  `;
}
