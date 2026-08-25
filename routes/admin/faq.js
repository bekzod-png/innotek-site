import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick } from "../../lib/render.js";
import { listAll, findById, insert, update, remove } from "../../lib/db.js";

export function listFaqPage({ flash } = {}) {
  const faqs = listAll("faq");
  const rows = faqs.map(
    (f) => `<tr>
    <td>${esc(pick(f.question, "uz"))}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/faq/${f.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/faq/${f.id}/delete" data-confirm="Savolni o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/faq/new">+ Yangi savol</a></div>
    <div class="admin-card">${table({ headers: ["Savol (UZ)", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/faq", title: "Savol-javob", body, flash });
}

export function faqFormPage({ faq, flash } = {}) {
  const isEdit = !!faq;
  const f = faq || { question: {}, answer: {} };
  const body = `
    <form method="post" action="${isEdit ? `/admin/faq/${f.id}/edit` : "/admin/faq/new"}" class="admin-card">
      ${langFieldGroup({ id: "question", label: "Savol", name: "question", value: f.question, required: true })}
      ${langFieldGroup({ id: "answer", label: "Javob", name: "answer", value: f.answer, textarea: true, required: true })}
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/faq", title: isEdit ? "Savolni tahrirlash" : "Yangi savol", body, flash });
}

export async function createFaq(form) {
  await insert("faq", { question: collectLangField(form, "question"), answer: collectLangField(form, "answer") });
}

export async function updateFaq(id, form) {
  await update("faq", id, { question: collectLangField(form, "question"), answer: collectLangField(form, "answer") });
}

export async function deleteFaq(id) {
  await remove("faq", id);
}

export function getFaq(id) {
  return findById("faq", id);
}
