// Vanilla JS only — progressive enhancement, no build step, no dependencies.
(function () {
  "use strict";

  // ---- Mobile nav toggle ----
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Admin: language tab switcher (uz/ru/en fields grouped in a form) ----
  document.querySelectorAll("[data-lang-tabs]").forEach(function (group) {
    var id = group.getAttribute("data-lang-tabs");
    var btns = group.querySelectorAll(".lang-tab-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var lang = btn.getAttribute("data-lang");
        btns.forEach(function (b) { b.classList.toggle("active", b === btn); });
        document.querySelectorAll('[data-lang-panel="' + id + '"]').forEach(function (panel) {
          panel.classList.toggle("active", panel.getAttribute("data-lang") === lang);
        });
      });
    });
  });

  // ---- Price calculator wizard ----
  var calc = document.getElementById("calculator");
  if (calc) {
    var steps = Array.prototype.slice.call(calc.querySelectorAll(".calc-step"));
    var dots = Array.prototype.slice.call(calc.querySelectorAll(".step-dot"));
    var current = 0;

    // Base price per m^2 (UZS) by project type — rough planning figures only.
    var BASE_RATE = { residential: 3200000, commercial: 4100000, renovation: 1500000, industrial: 2600000 };
    var EXTRA_RATE = { design: 180000, supervision: 90000, furniture: 260000 };

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
      dots.forEach(function (d, idx) {
        d.classList.toggle("active", idx === i);
        d.classList.toggle("done", idx < i);
      });
      current = i;
      if (i === steps.length - 1) computeEstimate();
    }

    calc.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!validateStep(current)) return;
        if (current < steps.length - 1) showStep(current + 1);
      });
    });
    calc.querySelectorAll("[data-prev]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (current > 0) showStep(current - 1);
      });
    });

    function validateStep(i) {
      var step = steps[i];
      var invalid = step.querySelector(":invalid");
      if (invalid) { invalid.reportValidity(); return false; }
      return true;
    }

    function computeEstimate() {
      var type = (calc.querySelector('input[name="projectType"]:checked') || {}).value || "residential";
      var area = parseFloat(calc.querySelector('[name="area"]').value) || 0;
      var floors = parseFloat(calc.querySelector('[name="floors"]').value) || 1;
      var extras = Array.prototype.slice
        .call(calc.querySelectorAll('input[name="extras"]:checked'))
        .map(function (i) { return i.value; });

      var base = (BASE_RATE[type] || BASE_RATE.residential) * area;
      var floorFactor = 1 + Math.max(0, floors - 1) * 0.04;
      var extraTotal = extras.reduce(function (sum, key) { return sum + (EXTRA_RATE[key] || 0) * area; }, 0);
      var total = base * floorFactor + extraTotal;
      var low = total * 0.9;
      var high = total * 1.15;

      var fmt = function (n) {
        return new Intl.NumberFormat("uz-UZ").format(Math.round(n / 10000) * 10000);
      };
      var out = calc.querySelector("[data-price-range]");
      if (out) out.textContent = fmt(low) + " – " + fmt(high) + " UZS";

      var hiddenEstimate = calc.querySelector('[name="estimateLow"]');
      var hiddenEstimateHigh = calc.querySelector('[name="estimateHigh"]');
      if (hiddenEstimate) hiddenEstimate.value = Math.round(low);
      if (hiddenEstimateHigh) hiddenEstimateHigh.value = Math.round(high);
    }

    calc.querySelectorAll('input[name="area"], input[name="floors"], input[name="extras"], input[name="projectType"]').forEach(function (el) {
      el.addEventListener("change", function () {
        if (current === steps.length - 1) computeEstimate();
      });
    });

    showStep(0);
  }

  // ---- Simple client-side confirm for admin delete actions ----
  document.querySelectorAll("[data-confirm]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!window.confirm(form.getAttribute("data-confirm"))) e.preventDefault();
    });
  });
})();
