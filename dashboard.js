import { adminLayout } from "../../lib/admin-ui.js";
import { esc, pick } from "../../lib/render.js";
import { listAll } from "../../lib/db.js";

export function dashboardPage({ flash } = {}) {
  const services = listAll("services");
  const projects = listAll("projects");
  const blog = listAll("blog");
  const messages = listAll("messages");
  const leads = listAll("calcLeads");
  const applications = listAll("vacancyApplications");
  const recentMessages = [...messages].reverse().slice(0, 5);

  const body = `
    <div class="stat-cards">
      <div class="stat-card"><b>${services.length}</b><span>Xizmatlar</span></div>
      <div class="stat-card"><b>${projects.length}</b><span>Loyihalar</span></div>
      <div class="stat-card"><b>${blog.length}</b><span>Blog maqolalari</span></div>
      <div class="stat-card"><b>${messages.length + leads.length + applications.length}</b><span>Jami murojaatlar</span></div>
    </div>
    <div class="admin-card">
      <h3>So'nggi xabarlar</h3>
      ${
        recentMessages.length
          ? `<table class="admin-table"><thead><tr><th>Ism</th><th>Telefon</th><th>Xabar</th></tr></thead><tbody>
        ${recentMessages
          .map((m) => `<tr><td>${esc(m.name)}</td><td>${esc(m.phone)}</td><td>${esc(m.message)}</td></tr>`)
          .join("")}
      </tbody></table>
      <p style="margin-top:14px"><a href="/admin/messages">Barcha murojaatlarni ko'rish &rarr;</a></p>`
          : `<p style="color:var(--color-muted)">Hozircha xabarlar yo'q.</p>`
      }
    </div>
    <div class="admin-card">
      <h3>Tezkor havolalar</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn btn-outline btn-sm" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/services/new">+ Xizmat</a>
        <a class="btn btn-outline btn-sm" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/projects/new">+ Loyiha</a>
        <a class="btn btn-outline btn-sm" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/blog/new">+ Maqola</a>
        <a class="btn btn-outline btn-sm" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/vacancies/new">+ Vakansiya</a>
        <a class="btn btn-outline btn-sm" style="color:var(--color-ink);border-color:var(--color-line)" href="/admin/experts/new">+ Mutaxassis</a>
      </div>
    </div>
  `;
  return adminLayout({ activePath: "/admin", title: "Boshqaruv paneli", body, flash });
}
