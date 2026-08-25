import { adminLayout, table } from "../../lib/admin-ui.js";
import { esc } from "../../lib/render.js";
import { listAll, remove } from "../../lib/db.js";

export function listMessagesPage({ flash } = {}) {
  const messages = [...listAll("messages")].reverse();
  const leads = [...listAll("calcLeads")].reverse();
  const applications = [...listAll("vacancyApplications")].reverse();

  const msgRows = messages.map(
    (m) => `<tr>
    <td>${esc(fmtDate(m.createdAt))}</td>
    <td><b>${esc(m.name)}</b><br><span style="color:var(--color-muted)">${esc(m.phone)}${m.email ? " · " + esc(m.email) : ""}</span></td>
    <td>${esc(m.service || "—")}</td>
    <td>${esc(m.message)}</td>
    <td class="admin-actions">${deleteForm("messages", m.id, "Xabarni")}</td>
  </tr>`
  );

  const leadRows = leads.map(
    (l) => `<tr>
    <td>${esc(fmtDate(l.createdAt))}</td>
    <td><b>${esc(l.name)}</b><br><span style="color:var(--color-muted)">${esc(l.phone)}</span></td>
    <td>${esc(l.projectType)}</td>
    <td>${esc(l.area)} m² · ${esc(l.floors)} qavat</td>
    <td>${esc(Number(l.estimateLow).toLocaleString("uz-UZ"))} – ${esc(Number(l.estimateHigh).toLocaleString("uz-UZ"))} so'm</td>
    <td class="admin-actions">${deleteForm("calcLeads", l.id, "So'rovni")}</td>
  </tr>`
  );

  const appRows = applications.map(
    (a) => `<tr>
    <td>${esc(fmtDate(a.createdAt))}</td>
    <td><b>${esc(a.name)}</b><br><span style="color:var(--color-muted)">${esc(a.phone)}${a.email ? " · " + esc(a.email) : ""}</span></td>
    <td>${esc(a.vacancyTitle || "—")}</td>
    <td>${esc(a.message || "—")}</td>
    <td class="admin-actions">${deleteForm("vacancyApplications", a.id, "Arizani")}</td>
  </tr>`
  );

  const body = `
    <div class="admin-card">
      <h3>Aloqa xabarlari (${messages.length})</h3>
      ${messages.length ? table({ headers: ["Sana", "Kontakt", "Xizmat", "Xabar", ""], rows: msgRows }) : emptyNote()}
    </div>
    <div class="admin-card">
      <h3>Kalkulyator so'rovlari (${leads.length})</h3>
      ${leads.length ? table({ headers: ["Sana", "Kontakt", "Loyiha turi", "Parametrlar", "Taxminiy narx", ""], rows: leadRows }) : emptyNote()}
    </div>
    <div class="admin-card">
      <h3>Vakansiya arizalari (${applications.length})</h3>
      ${applications.length ? table({ headers: ["Sana", "Kontakt", "Lavozim", "Xabar", ""], rows: appRows }) : emptyNote()}
    </div>
  `;
  return adminLayout({ activePath: "/admin/messages", title: "Murojaatlar", body, flash });
}

function emptyNote() {
  return `<p style="color:var(--color-muted)">Hozircha bo'sh.</p>`;
}

function deleteForm(collection, id, label) {
  return `<form method="post" action="/admin/messages/${collection}/${id}/delete" data-confirm="${label} o'chirishni tasdiqlaysizmi?">
    <button class="btn btn-sm" style="background:#fbeae5;color:var(--color-danger)" type="submit">O'chirish</button>
  </form>`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export async function deleteMessageItem(collection, id) {
  const allowed = ["messages", "calcLeads", "vacancyApplications"];
  if (!allowed.includes(collection)) return;
  await remove(collection, id);
}
