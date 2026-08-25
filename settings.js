import { adminLayout } from "../../lib/admin-ui.js";
import { esc } from "../../lib/render.js";
import { getDb, saveDb } from "../../lib/db.js";
import { hashPassword, verifyPassword } from "../../lib/auth.js";

export function settingsPage({ flash } = {}) {
  const s = getDb().settings;
  const body = `
    <form method="post" action="/admin/settings" class="admin-card">
      <h3>Kompaniya ma'lumotlari</h3>
      <div class="form-grid">
        <div class="field"><label>Asosiy telefon</label><input type="text" name="phonePrimary" value="${esc(s.phonePrimary)}" required></div>
        <div class="field"><label>Qo'shimcha telefon</label><input type="text" name="phoneSecondary" value="${esc(s.phoneSecondary)}"></div>
        <div class="field"><label>Email</label><input type="email" name="email" value="${esc(s.email)}" required></div>
        <div class="field"><label>Telegram havolasi</label><input type="text" name="telegram" value="${esc(s.telegram)}"></div>
        <div class="field"><label>Instagram havolasi</label><input type="text" name="instagram" value="${esc(s.instagram)}"></div>
        <div class="field full"><label>Manzil</label><input type="text" name="address" value="${esc(s.address)}" required></div>
      </div>
      <h3>Statistika (bosh sahifada ko'rsatiladi)</h3>
      <div class="form-grid">
        <div class="field"><label>Bajarilgan loyihalar</label><input type="text" name="stat_projects" value="${esc(s.stats.projects)}"></div>
        <div class="field"><label>Tajriba (yil)</label><input type="text" name="stat_experience" value="${esc(s.stats.experience)}"></div>
        <div class="field"><label>Mutaxassislar soni</label><input type="text" name="stat_specialists" value="${esc(s.stats.specialists)}"></div>
        <div class="field"><label>Kafolat (yil)</label><input type="text" name="stat_warranty" value="${esc(s.stats.warranty)}"></div>
      </div>
      <button class="btn btn-primary" type="submit">Saqlash</button>
    </form>

    <form method="post" action="/admin/settings/password" class="admin-card">
      <h3>Admin parolini o'zgartirish</h3>
      <div class="form-grid">
        <div class="field full"><label>Joriy parol</label><input type="password" name="currentPassword" required></div>
        <div class="field"><label>Yangi parol</label><input type="password" name="newPassword" required minlength="6"></div>
        <div class="field"><label>Yangi parolni takrorlang</label><input type="password" name="confirmPassword" required minlength="6"></div>
      </div>
      <button class="btn btn-dark" type="submit">Parolni yangilash</button>
    </form>
  `;
  return adminLayout({ activePath: "/admin/settings", title: "Sozlamalar", body, flash });
}

export async function updateSettings(form) {
  const db = getDb();
  db.settings.phonePrimary = form.get("phonePrimary") || db.settings.phonePrimary;
  db.settings.phoneSecondary = form.get("phoneSecondary") || "";
  db.settings.email = form.get("email") || db.settings.email;
  db.settings.telegram = form.get("telegram") || "";
  db.settings.instagram = form.get("instagram") || "";
  db.settings.address = form.get("address") || db.settings.address;
  db.settings.stats = {
    projects: form.get("stat_projects") || db.settings.stats.projects,
    experience: form.get("stat_experience") || db.settings.stats.experience,
    specialists: form.get("stat_specialists") || db.settings.stats.specialists,
    warranty: form.get("stat_warranty") || db.settings.stats.warranty,
  };
  await saveDb();
}

export async function changePassword(form) {
  const db = getDb();
  const current = form.get("currentPassword") || "";
  const next = form.get("newPassword") || "";
  const confirm = form.get("confirmPassword") || "";
  if (!verifyPassword(current, db.settings.adminPasswordHash)) {
    return { ok: false, error: "Joriy parol noto'g'ri." };
  }
  if (next.length < 6) {
    return { ok: false, error: "Yangi parol kamida 6 belgidan iborat bo'lishi kerak." };
  }
  if (next !== confirm) {
    return { ok: false, error: "Yangi parollar mos kelmadi." };
  }
  db.settings.adminPasswordHash = hashPassword(next);
  await saveDb();
  return { ok: true };
}
