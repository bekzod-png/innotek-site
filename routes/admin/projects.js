import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick } from "../../lib/render.js";
import { listAll, findById, insert, update, remove, slugify } from "../../lib/db.js";

const CATEGORIES = ["residential", "commercial", "renovation", "industrial"];

export function listProjectsPage({ flash } = {}) {
  const projects = listAll("projects");
  const rows = projects.map(
    (p) => `<tr>
    <td>${esc(pick(p.title, "uz"))}</td>
    <td>${esc(p.category)}</td>
    <td>${p.year}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/projects/${p.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/projects/${p.id}/delete" data-confirm="Loyihani o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/projects/new">+ Yangi loyiha</a></div>
    <div class="admin-card">${table({ headers: ["Nomi (UZ)", "Kategoriya", "Yil", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/projects", title: "Loyihalar", body, flash });
}

export function projectFormPage({ project, flash } = {}) {
  const isEdit = !!project;
  const p = project || { title: {}, summary: {}, description: {}, location: {}, category: "residential", year: new Date().getFullYear() };
  const body = `
    <form method="post" action="${isEdit ? `/admin/projects/${p.id}/edit` : "/admin/projects/new"}" class="admin-card">
      ${langFieldGroup({ id: "title", label: "Nomi", name: "title", value: p.title, required: true })}
      ${langFieldGroup({ id: "location", label: "Joylashuvi", name: "location", value: p.location })}
      ${langFieldGroup({ id: "summary", label: "Qisqacha tavsif (kartochka uchun)", name: "summary", value: p.summary, textarea: true })}
      ${langFieldGroup({ id: "description", label: "To'liq tavsif", name: "description", value: p.description, textarea: true })}
      <div class="form-grid">
        <div class="field">
          <label>Kategoriya</label>
          <select name="category">${CATEGORIES.map((c) => `<option value="${c}" ${p.category === c ? "selected" : ""}>${c}</option>`).join("")}</select>
        </div>
        <div class="field">
          <label>Yil</label>
          <input type="number" name="year" value="${esc(p.year)}" min="2000" max="2100">
        </div>
      </div>
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/projects", title: isEdit ? "Loyihani tahrirlash" : "Yangi loyiha", body, flash });
}

export async function createProject(form) {
  const title = collectLangField(form, "title");
  const slug = slugify(title.uz || title.ru || title.en);
  await insert("projects", {
    slug,
    category: form.get("category") || "residential",
    year: Number(form.get("year")) || new Date().getFullYear(),
    title,
    location: collectLangField(form, "location"),
    summary: collectLangField(form, "summary"),
    description: collectLangField(form, "description"),
  });
}

export async function updateProject(id, form) {
  const title = collectLangField(form, "title");
  await update("projects", id, {
    category: form.get("category") || "residential",
    year: Number(form.get("year")) || new Date().getFullYear(),
    title,
    location: collectLangField(form, "location"),
    summary: collectLangField(form, "summary"),
    description: collectLangField(form, "description"),
  });
}

export async function deleteProject(id) {
  await remove("projects", id);
}

export function getProject(id) {
  return findById("projects", id);
}
