import { t, pick, sectionHeading, esc, breadcrumb, money } from "../lib/render.js";
import { icon } from "../lib/icons.js";
import { listAll, findBySlug } from "../lib/db.js";

const CATEGORY_LABEL = {
  shelving: { uz: "Stellajlar", ru: "Стеллажи", en: "Shelving" },
  furniture: { uz: "Metall mebel", ru: "Металлическая мебель", en: "Metal furniture" },
};

export function renderProductsList(lang, category) {
  let products = listAll("products");
  if (category) products = products.filter((p) => p.category === category);
  const categories = Object.keys(CATEGORY_LABEL);

  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "products_title"))}</h1>
      <p>${esc(t(lang, "products_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_products") }])}
  <section class="block">
    <div class="container">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px">
        <a class="btn btn-sm ${!category ? "btn-dark" : "btn-outline"}" style="${!category ? "" : "color:var(--color-ink);border-color:var(--color-line)"}" href="/products?lang=${lang}">${lang === "ru" ? "Все" : lang === "en" ? "All" : "Barchasi"}</a>
        ${categories
          .map(
            (c) =>
              `<a class="btn btn-sm ${category === c ? "btn-dark" : "btn-outline"}" style="${category === c ? "" : "color:var(--color-ink);border-color:var(--color-line)"}" href="/products?category=${c}&lang=${lang}">${esc(pick(CATEGORY_LABEL[c], lang))}</a>`
          )
          .join("")}
      </div>
      <div class="grid-3">
        ${products
          .map(
            (p) => `
          <div class="card">
            <div class="card-media">${icon(p.icon, 40)}</div>
            <div class="card-body">
              <span class="tag">${esc(pick(CATEGORY_LABEL[p.category] || {}, lang))}</span>
              <h3><a href="/products/${esc(p.slug)}?lang=${lang}" style="color:inherit">${esc(pick(p.title, lang))}</a></h3>
              <p>${esc(pick(p.summary, lang))}</p>
              ${p.priceFrom ? `<p class="price">${lang === "ru" ? "от" : lang === "en" ? "from" : "dan"} ${money(p.priceFrom)} UZS</p>` : ""}
              <div class="card-foot"><a href="/products/${esc(p.slug)}?lang=${lang}">${esc(t(lang, "cta_more"))} &rarr;</a></div>
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
        <div><h2>${esc(t(lang, "contact_title"))}</h2><p>${esc(t(lang, "contact_subtitle"))}</p></div>
        <a class="btn btn-primary" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  `;
}

export function renderProductDetail(lang, slug) {
  const product = findBySlug("products", slug);
  if (!product) return null;
  const others = listAll("products").filter((p) => p.slug !== slug && p.category === product.category).slice(0, 3);

  return `
  ${breadcrumb(lang, [{ label: t(lang, "nav_products"), href: `/products?lang=${lang}` }, { label: pick(product.title, lang) }])}
  <section class="block">
    <div class="container detail-body">
      <div class="card-icon" style="margin-bottom:16px">${icon(product.icon, 30)}</div>
      <span class="tag">${esc(pick(CATEGORY_LABEL[product.category] || {}, lang))}</span>
      <h1>${esc(pick(product.title, lang))}</h1>
      ${product.specs ? `<p class="meta-row"><b>${esc(pick(product.specs, lang))}</b></p>` : ""}
      ${product.priceFrom ? `<p class="price" style="font-size:1.1rem">${lang === "ru" ? "Narxi" : "Narxi"}: ${lang === "ru" ? "от" : lang === "en" ? "from" : "dan"} ${money(product.priceFrom)} UZS</p>` : ""}
      <div>${pick(product.description, lang).split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
        <a class="btn btn-primary" href="/calculator?lang=${lang}">${esc(t(lang, "cta_calc"))}</a>
        <a class="btn btn-dark" href="/contact?lang=${lang}">${esc(t(lang, "cta_order"))}</a>
      </div>
    </div>
  </section>
  ${
    others.length
      ? `<section class="block alt">
    <div class="container">
      ${sectionHeading(t(lang, "products_title"))}
      <div class="grid-3">
        ${others
          .map(
            (p) => `
          <div class="card">
            <div class="card-media">${icon(p.icon, 34)}</div>
            <div class="card-body">
              <h3><a href="/products/${esc(p.slug)}?lang=${lang}" style="color:inherit">${esc(pick(p.title, lang))}</a></h3>
              <p>${esc(pick(p.summary, lang))}</p>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  </section>`
      : ""
  }
  `;
}
