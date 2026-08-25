import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick } from "../../lib/render.js";
import { listAll, findById, insert, update, remove, slugify } from "../../lib/db.js";

export function listVacanciesPage({ flash } = {}) {
  const vacancies = listAll("vacancies");
  const rows = vacancies.map(
    (v) => `<tr>
    <td>${esc(pick(v.title, "uz"))}</td>
    <td>${v.active ? '<span class="badge badge-green">Faol</span>' : '<span class="badge badge-gray">Nofaol</span>'}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/vacancies/${v.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/vacancies/${v.id}/delete" data-confirm="Vakansiyani o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/vacancies/new">+ Yangi vakansiya</a></div>
    <div class="admin-card">${table({ headers: ["Lavozim (UZ)", "Holati", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/vacancies", title: "Vakansiyalar", body, flash });
}

export function vacancyFormPage({ vacancy, flash } = {}) {
  const isEdit = !!vacancy;
  const v = vacancy || { title: {}, location: {}, type: {}, description: {}, requirements: {}, active: true };
  const body = `
    <form method="post" action="${isEdit ? `/admin/vacancies/${v.id}/edit` : "/admin/vacancies/new"}" class="admin-card">
      ${langFieldGroup({ id: "title", label: "Lavozim nomi", name: "title", value: v.title, required: true })}
      ${langFieldGroup({ id: "location", label: "Joylashuv", name: "location", value: v.location })}
      ${langFieldGroup({ id: "type", label: "Bandlik turi", name: "type", value: v.type })}
      ${langFieldGroup({ id: "description", label: "Lavozim tavsifi", name: "description", value: v.description, textarea: true })}
      ${langFieldGroup({ id: "requirements", label: "Talablar", name: "requirements", value: v.requirements, textarea: true })}
      <label style="display:flex;align-items:center;gap:8px;margin:14px 0"><input type="checkbox" name="active" ${v.active ? "checked" : ""}> Faol (saytda ko'rinadi)</label>
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/vacancies", title: isEdit ? "Vakansiyani tahrirlash" : "Yangi vakansiya", body, flash });
}

function collectVacancy(form) {
  const title = collectLangField(form, "title");
  return {
    title,
    location: collectLangField(form, "location"),
    type: collectLangField(form, "type"),
    description: collectLangField(form, "description"),
    requirements: collectLangField(form, "requirements"),
    active: form.get("active") === "on",
  };
}

export async function createVacancy(form) {
  const data = collectVacancy(form);
  const slug = slugify(data.title.uz || data.title.ru || data.title.en);
  await insert("vacancies", { slug, ...data });
}

export async function updateVacancy(id, form) {
  await update("vacancies", id, collectVacancy(form));
}

export async function deleteVacancy(id) {
  await remove("vacancies", id);
}

export function getVacancy(id) {
  return findById("vacancies", id);
}
