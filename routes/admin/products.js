import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick, money } from "../../lib/render.js";
import { listAll, findById, insert, update, remove, slugify } from "../../lib/db.js";

const CATEGORIES = ["shelving", "furniture"];

export function listProductsPage({ flash } = {}) {
  const products = listAll("products");
  const rows = products.map(
    (p) => `<tr>
    <td>${esc(pick(p.title, "uz"))}</td>
    <td>${esc(p.category)}</td>
    <td>${p.priceFrom ? money(p.priceFrom) + " so'm" : "—"}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/products/${p.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/products/${p.id}/delete" data-confirm="Mahsulotni o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/products/new">+ Yangi mahsulot</a></div>
    <div class="admin-card">${table({ headers: ["Nomi (UZ)", "Kategoriya", "Narx", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/products", title: "Mahsulotlar", body, flash });
}

export function productFormPage({ product, flash } = {}) {
  const isEdit = !!product;
  const p = product || { title: {}, summary: {}, description: {}, specs: {}, icon: "shelf", category: "shelving", priceFrom: "" };
  const icons = ["shelf", "cabinet", "build", "design", "measure"];
  const body = `
    <form method="post" action="${isEdit ? `/admin/products/${p.id}/edit` : "/admin/products/new"}" class="admin-card">
      ${langFieldGroup({ id: "title", label: "Nomi", name: "title", value: p.title, required: true })}
      ${langFieldGroup({ id: "summary", label: "Qisqacha tavsif (kartochka uchun)", name: "summary", value: p.summary, textarea: true })}
      ${langFieldGroup({ id: "description", label: "To'liq tavsif", name: "description", value: p.description, textarea: true })}
      ${langFieldGroup({ id: "specs", label: "Texnik xususiyat (masalan: yuk ko'tarish)", name: "specs", value: p.specs })}
      <div class="form-grid">
        <div class="field">
          <label>Kategoriya</label>
          <select name="category">${CATEGORIES.map((c) => `<option value="${c}" ${p.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Ikonka</label>
          <select name="icon">${icons.map((i) => `<option value="${i}" ${p.icon === i ? "selected" : ""}>${i}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Narxi (so'mdan boshlab, ixtiyoriy)</label>
          <input type="number" name="priceFrom" value="${esc(p.priceFrom ?? "")}" min="0" step="1000">
        </div>
      </div>
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/products", title: isEdit ? "Mahsulotni tahrirlash" : "Yangi mahsulot", body, flash });
}

export async function createProduct(form) {
  const title = collectLangField(form, "title");
  const slug = slugify(title.uz || title.ru || title.en);
  await insert("products", {
    slug,
    category: form.get("category") || "shelving",
    icon: form.get("icon") || "shelf",
    title,
    summary: collectLangField(form, "summary"),
    description: collectLangField(form, "description"),
    specs: collectLangField(form, "specs"),
    priceFrom: form.get("priceFrom") ? Number(form.get("priceFrom")) : null,
  });
}

export async function updateProduct(id, form) {
  const title = collectLangField(form, "title");
  await update("products", id, {
    category: form.get("category") || "shelving",
    icon: form.get("icon") || "shelf",
    title,
    summary: collectLangField(form, "summary"),
    description: collectLangField(form, "description"),
    specs: collectLangField(form, "specs"),
    priceFrom: form.get("priceFrom") ? Number(form.get("priceFrom")) : null,
  });
}

export async function deleteProduct(id) {
  await remove("products", id);
}

export function getProduct(id) {
  return findById("products", id);
}
