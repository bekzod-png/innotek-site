import { adminLayout, langFieldGroup, collectLangField, table } from "../../lib/admin-ui.js";
import { esc, pick } from "../../lib/render.js";
import { listAll, findById, insert, update, remove, slugify } from "../../lib/db.js";

export function listBlogPage({ flash } = {}) {
  const posts = [...listAll("blog")].sort((a, b) => (a.date < b.date ? 1 : -1));
  const rows = posts.map(
    (b) => `<tr>
    <td>${esc(pick(b.title, "uz"))}</td>
    <td>${esc(b.date)}</td>
    <td class="admin-actions">
      <a class="btn btn-sm btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/blog/${b.id}/edit">Tahrirlash</a>
      <form method="post" action="/admin/blog/${b.id}/delete" data-confirm="Maqolani o'chirishni tasdiqlaysizmi?">
        <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
      </form>
    </td>
  </tr>`
  );
  const body = `
    <div style="margin-bottom:16px"><a class="btn btn-primary" href="/admin/blog/new">+ Yangi maqola</a></div>
    <div class="admin-card">${table({ headers: ["Sarlavha (UZ)", "Sana", ""], rows })}</div>
  `;
  return adminLayout({ activePath: "/admin/blog", title: "Blog", body, flash });
}

export function blogFormPage({ post, flash } = {}) {
  const isEdit = !!post;
  const b = post || { title: {}, excerpt: {}, content: {}, date: new Date().toISOString().slice(0, 10), author: "INNOTEK INVEST" };
  const body = `
    <form method="post" action="${isEdit ? `/admin/blog/${b.id}/edit` : "/admin/blog/new"}" class="admin-card">
      ${langFieldGroup({ id: "title", label: "Sarlavha", name: "title", value: b.title, required: true })}
      ${langFieldGroup({ id: "excerpt", label: "Qisqacha (kartochka uchun)", name: "excerpt", value: b.excerpt, textarea: true })}
      ${langFieldGroup({ id: "content", label: "To'liq matn", name: "content", value: b.content, textarea: true })}
      <div class="form-grid">
        <div class="field"><label>Sana</label><input type="date" name="date" value="${esc(b.date)}"></div>
        <div class="field"><label>Muallif</label><input type="text" name="author" value="${esc(b.author)}"></div>
      </div>
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/blog", title: isEdit ? "Maqolani tahrirlash" : "Yangi maqola", body, flash });
}

export async function createPost(form) {
  const title = collectLangField(form, "title");
  const slug = slugify(title.uz || title.ru || title.en);
  await insert("blog", {
    slug,
    date: form.get("date") || new Date().toISOString().slice(0, 10),
    author: form.get("author") || "INNOTEK INVEST",
    title,
    excerpt: collectLangField(form, "excerpt"),
    content: collectLangField(form, "content"),
  });
}

export async function updatePost(id, form) {
  const title = collectLangField(form, "title");
  await update("blog", id, {
    date: form.get("date") || new Date().toISOString().slice(0, 10),
    author: form.get("author") || "INNOTEK INVEST",
    title,
    excerpt: collectLangField(form, "excerpt"),
    content: collectLangField(form, "content"),
  });
}

export async function deletePost(id) {
  await remove("blog", id);
}

export function getPost(id) {
  return findById("blog", id);
}
