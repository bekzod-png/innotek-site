import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick, money } from "../../lib/render.js";
import { listAll, findById, insert, update, remove, slugify } from "../../lib/db.js";

export function listServicesPage({ flash } = {}) {
  const services = listAll("services");
  const rows = services.map(
    (s) => `<tr>
    <td>${esc(pick(s.title, "uz"))}</td>
    <td><code>${esc(s.slug)}</code></td>
    <td>${s.priceFrom ? money(s.priceFrom) + " so'm" : "—"}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/services/${s.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/services/${s.id}/delete" data-confirm="Xizmatni o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/services/new">+ Yangi xizmat</a></div>
    <div class="admin-card">${table({ headers: ["Nomi (UZ)", "Slug", "Narx", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/services", title: "Xizmatlar", body, flash });
}

export function serviceFormPage({ service, flash } = {}) {
  const isEdit = !!service;
  const s = service || { title: {}, summary: {}, description: {}, icon: "blueprint", priceFrom: "" };
  const icons = ["blueprint", "crane", "network", "renovate", "shield", "design", "measure", "build"];
  const body = `
    <form method="post" action="${isEdit ? `/admin/services/${s.id}/edit` : "/admin/services/new"}" class="admin-card">
      ${langFieldGroup({ id: "title", label: "Nomi", name: "title", value: s.title, required: true })}
      ${langFieldGroup({ id: "summary", label: "Qisqacha tavsif (kartochka uchun)", name: "summary", value: s.summary, textarea: true })}
      ${langFieldGroup({ id: "description", label: "To'liq tavsif (sahifa uchun, bo'sh qatorlar bilan abzatslarga bo'linadi)", name: "description", value: s.description, textarea: true })}
      <div class="form-grid">
        <div class="field">
          <label>Ikonka</label>
          <select name="icon">${icons.map((i) => `<option value="${i}" ${s.icon === i ? "selected" : ""}>${i}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Narxi (so'mdan boshlab, ixtiyoriy)</label>
          <input type="number" name="priceFrom" value="${esc(s.priceFrom ?? "")}" min="0" step="1000">
        </div>
      </div>
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/services", title: isEdit ? "Xizmatni tahrirlash" : "Yangi xizmat", body, flash });
}

export async function createService(form) {
  const title = collectLangField(form, "title");
  const slug = slugify(title.uz || title.ru || title.en);
  await insert("services", {
    slug,
    icon: form.get("icon") || "blueprint",
    title,
    summary: collectLangField(form, "summary"),
    description: collectLangField(form, "description"),
    priceFrom: form.get("priceFrom") ? Number(form.get("priceFrom")) : null,
  });
}

export async function updateService(id, form) {
  const title = collectLangField(form, "title");
  await update("services", id, {
    icon: form.get("icon") || "blueprint",
    title,
    summary: collectLangField(form, "summary"),
    description: collectLangField(form, "description"),
    priceFrom: form.get("priceFrom") ? Number(form.get("priceFrom")) : null,
  });
}

export async function deleteService(id) {
  await remove("services", id);
}

export function getService(id) {
  return findById("services", id);
}
