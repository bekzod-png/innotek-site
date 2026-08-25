import { t, esc, breadcrumb } from "../lib/render.js";

export function renderCalculator(lang, { success } = {}) {
  return `
  <div class="page-head">
    <div class="container">
      <h1>${esc(t(lang, "calc_title"))}</h1>
      <p>${esc(t(lang, "calc_subtitle"))}</p>
    </div>
  </div>
  ${breadcrumb(lang, [{ label: t(lang, "nav_calculator") }])}
  <section class="block">
    <div class="container">
      ${success ? `<div class="alert alert-success" style="max-width:760px;margin:0 auto 20px">${esc(t(lang, "success_calc"))}</div>` : ""}
      <form class="calc-wrap" id="calculator" method="post" action="/calculator?lang=${lang}">
        <input type="hidden" name="estimateLow" value="0">
        <input type="hidden" name="estimateHigh" value="0">
        <div class="calc-steps-nav">
          <div class="step-dot active">1</div>
          <div class="step-dot">2</div>
          <div class="step-dot">3</div>
          <div class="step-dot">4</div>
        </div>

        <div class="calc-step active">
          <h3>${esc(t(lang, "calc_step1"))}</h3>
          <div class="option-grid">
            ${projectTypeOption(lang, "residential", t(lang, "calc_type_residential"), true)}
            ${projectTypeOption(lang, "commercial", t(lang, "calc_type_commercial"))}
            ${projectTypeOption(lang, "renovation", t(lang, "calc_type_renovation"))}
            ${projectTypeOption(lang, "industrial", t(lang, "calc_type_industrial"))}
          </div>
          <div class="calc-nav-btns"><span></span><button type="button" class="btn btn-primary" data-next>${esc(t(lang, "cta_more"))} &rarr;</button></div>
        </div>

        <div class="calc-step">
          <h3>${esc(t(lang, "calc_step2"))}</h3>
          <div class="field">
            <label>${esc(t(lang, "calc_area"))}</label>
            <input type="number" name="area" min="10" max="100000" step="1" required placeholder="120">
          </div>
          <div class="field">
            <label>${esc(t(lang, "calc_floors"))}</label>
            <input type="number" name="floors" min="1" max="50" step="1" value="1" required>
          </div>
          <div class="calc-nav-btns">
            <button type="button" class="btn btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" data-prev>&larr; ${esc(t(lang, "back"))}</button>
            <button type="button" class="btn btn-primary" data-next>${esc(t(lang, "cta_more"))} &rarr;</button>
          </div>
        </div>

        <div class="calc-step">
          <h3>${esc(t(lang, "calc_step3"))}</h3>
          <div class="option-grid">
            <label class="option-card"><input type="checkbox" name="extras" value="design"> ${esc(t(lang, "calc_extra_design"))}</label>
            <label class="option-card"><input type="checkbox" name="extras" value="supervision"> ${esc(t(lang, "calc_extra_supervision"))}</label>
            <label class="option-card"><input type="checkbox" name="extras" value="furniture"> ${esc(t(lang, "calc_extra_furniture"))}</label>
          </div>
          <div class="calc-nav-btns">
            <button type="button" class="btn btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" data-prev>&larr; ${esc(t(lang, "back"))}</button>
            <button type="button" class="btn btn-primary" data-next>${esc(t(lang, "cta_more"))} &rarr;</button>
          </div>
        </div>

        <div class="calc-step">
          <h3>${esc(t(lang, "calc_step4"))}</h3>
          <div class="calc-result">
            <span>${esc(t(lang, "calc_result_title"))}</span>
            <div class="price-range" data-price-range>—</div>
            <p class="help-text" style="margin:0 0 20px">${esc(t(lang, "calc_result_note"))}</p>
          </div>
          <div class="field">
            <label>${esc(t(lang, "form_name"))}</label>
            <input type="text" name="name" required>
          </div>
          <div class="field">
            <label>${esc(t(lang, "form_phone"))}</label>
            <input type="tel" name="phone" required placeholder="+998 90 123 45 67">
          </div>
          <div class="calc-nav-btns">
            <button type="button" class="btn btn-outline" style="color:var(--color-ink);border-color:var(--color-line)" data-prev>&larr; ${esc(t(lang, "back"))}</button>
            <button type="submit" class="btn btn-primary">${esc(t(lang, "calc_submit"))}</button>
          </div>
        </div>
      </form>
    </div>
  </section>
  `;
}

function projectTypeOption(lang, value, label, checked = false) {
  return `<label class="option-card"><input type="radio" name="projectType" value="${value}" ${checked ? "checked" : ""} required>${esc(label)}</label>`;
}
