import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick } from "../../lib/render.js";
import { listAll, findById, insert, update, remove } from "../../lib/db.js";

export function listExpertsPage({ flash } = {}) {
  const experts = listAll("experts");
  const rows = experts.map(
    (e) => `<tr>
    <td>${esc(e.name)}</td>
    <td>${esc(pick(e.role, "uz"))}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/experts/${e.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/experts/${e.id}/delete" data-confirm="Mutaxassisni o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/experts/new">+ Yangi mutaxassis</a></div>
    <div class="admin-card">${table({ headers: ["Ism", "Lavozim (UZ)", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/experts", title: "Mutaxassislar", body, flash });
}

export function expertFormPage({ expert, flash } = {}) {
  const isEdit = !!expert;
  const e = expert || { name: "", role: {}, bio: {} };
  const body = `
    <form method="post" action="${isEdit ? `/admin/experts/${e.id}/edit` : "/admin/experts/new"}" class="admin-card">
      <div class="field">
        <label>Ism-familiya</label>
        <input type="text" name="name" value="${esc(e.name)}" required>
      </div>
      ${langFieldGroup({ id: "role", label: "Lavozim", name: "role", value: e.role, required: true })}
      ${langFieldGroup({ id: "bio", label: "Qisqacha tavsif", name: "bio", value: e.bio, textarea: true })}
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/experts", title: isEdit ? "Mutaxassisni tahrirlash" : "Yangi mutaxassis", body, flash });
}

export async function createExpert(form) {
  await insert("experts", {
    name: (form.get("name") || "").trim(),
    role: collectLangField(form, "role"),
    bio: collectLangField(form, "bio"),
  });
}

export async function updateExpert(id, form) {
  await update("experts", id, {
    name: (form.get("name") || "").trim(),
    role: collectLangField(form, "role"),
    bio: collectLangField(form, "bio"),
  });
}

export async function deleteExpert(id) {
  await remove("experts", id);
}

export function getExpert(id) {
  return findById("experts", id);
}
