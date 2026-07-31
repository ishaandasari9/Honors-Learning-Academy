/* ============================================================
   HLA — Multi-step "Request a tutor" flow (students.html)
   Progressive enhancement over the fallback <form data-hla-form>:
   same fields, same length, same Supabase payload. Answers become
   taps wherever the set of answers is known. If this script never
   runs, the plain form is still there and works.
   ============================================================ */
(function () {
  "use strict";

  const root = document.querySelector("[data-reqflow]");
  const fallback = document.querySelector('form[data-hla-form="request"]');
  if (!root || !fallback || !window.HLA) return;

  const I = window.HLA_ICONS || {};
  const ARROW = I.arrow || "", SHIELD = I.shield || "", CHECK = I.check || "";
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const val = (sel) => { const e = root.querySelector(sel); return e ? e.value : ""; };
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---- Read the canonical field sets from the fallback form so the payload
     values stay identical to what admin + the webhook already expect. ---- */
  const grades = [...fallback.querySelectorAll('select[name="grade"] option')]
    .map(o => o.textContent.trim()).filter(v => v && !/^choose/i.test(v));
  const subjSel = fallback.querySelector('select[name="subject"]');
  const subjectGroups = [...subjSel.querySelectorAll("optgroup")].map(g => ({
    label: g.label, items: [...g.querySelectorAll("option")].map(o => o.textContent.trim())
  }));
  const OTHER_FALLBACK = (([...subjSel.children]
    .find(c => c.tagName === "OPTION" && /something else/i.test(c.textContent)) || {}).textContent || "Something else").trim();
  const formats = [...fallback.querySelectorAll('input[name="format"]')].map(i => i.value);
  /* Availability was a free-text field; give it a known set of day/time chips
     that join back into the same free-text-ish string the payload carries. */
  const availChips = ["Weekday mornings", "Weekday afternoons", "Weekday evenings",
    "Weekend mornings", "Weekend afternoons", "Weekend evenings"];

  /* ---- Steps ---- */
  function pills(name, values, type) {
    return values.map(v =>
      `<label class="choice"><input type="${type}" name="${name}" value="${esc(v)}">${esc(v)}</label>`).join("");
  }
  const steps = [
    { key: "grade", title: "What grade is your student in?",
      body: () => `<div class="reqflow__choices" role="radiogroup" aria-labelledby="rf-q-0">${pills("rf-grade", grades, "radio")}</div>` },
    { key: "subject", title: "What do they need help with?",
      body: () => {
        const groups = subjectGroups.map(g =>
          `<div class="reqflow__group"><p class="reqflow__grouplabel">${esc(g.label)}</p>
             <div class="reqflow__choices">${pills("rf-subject", g.items, "radio")}</div></div>`).join("");
        return `<div role="radiogroup" aria-labelledby="rf-q-1">${groups}
          <div class="reqflow__group"><div class="reqflow__choices">
            <label class="choice"><input type="radio" name="rf-subject" value="__other">Other</label>
          </div></div></div>
          <div class="reqflow__other field" data-other hidden>
            <label for="rf-subject-other">What subject?</label>
            <input id="rf-subject-other" type="text" autocomplete="off" placeholder="e.g. Robotics, ACT prep" />
          </div>`;
      } },
    { key: "availability", title: "When is your student usually free?", optional: true,
      hint: "Pick any that fit. You can skip this and tell us later.",
      body: () => `<div class="reqflow__choices" role="group" aria-labelledby="rf-q-2">${pills("rf-avail", availChips, "checkbox")}</div>` },
    { key: "format", title: "How would you like to meet?",
      body: () => `<div class="reqflow__choices" role="radiogroup" aria-labelledby="rf-q-3">${pills("rf-format", formats, "radio")}</div>` },
    { key: "details", title: "Last bit, so we can reach you.",
      body: () => `
        <div class="field"><label for="rf-student">Student's first name <span class="req">*</span></label>
          <input id="rf-student" type="text" autocomplete="given-name" placeholder="e.g. Maya" /></div>
        <div class="field"><label for="rf-email">Parent or guardian email <span class="req">*</span></label>
          <input id="rf-email" type="email" autocomplete="email" placeholder="you@email.com" />
          <span class="hint">This is how we'll send the match. We never share it.</span></div>
        <div class="field"><label for="rf-notes">Anything else we should know?</label>
          <textarea id="rf-notes" placeholder="A test coming up, a specific topic, an IEP, whatever helps us match well."></textarea></div>
        <p class="fineprint">${SHIELD} We're a nonprofit serving minors. We collect only what we need to match your student, and we don't sell or share it.</p>` }
  ];
  const TOTAL = steps.length;
  let cur = 0;

  /* ---- Build shell ---- */
  root.setAttribute("aria-label", "Request a tutor");
  root.innerHTML = `
    <div class="reqflow__progress">
      <p class="reqflow__count" role="status" aria-live="polite" data-count></p>
      <ol class="reqflow__dots" aria-hidden="true" data-dots>${steps.map(() => "<li></li>").join("")}</ol>
    </div>
    <div class="reqflow__steps" data-steps>${steps.map((s, i) => `
      <section class="reqflow__step" data-panel="${i}" hidden aria-labelledby="rf-q-${i}">
        <h4 class="reqflow__q" id="rf-q-${i}" tabindex="-1">${esc(s.title)}</h4>
        ${s.hint ? `<p class="reqflow__hint">${esc(s.hint)}</p>` : ""}
        <div class="reqflow__panelbody">${s.body()}</div>
      </section>`).join("")}</div>
    <p class="reqflow__err" role="alert" data-err></p>
    <div class="reqflow__nav">
      <button type="button" class="btn btn--ghost" data-back>Back</button>
      <button type="button" class="btn btn--primary reqflow__next" data-next></button>
    </div>
    <div class="form-success reqflow__success" data-success-panel hidden>
      <div class="form-success__ic">${CHECK}</div>
      <h3>Request received.</h3>
      <p style="margin:.5rem auto 0;max-width:44ch;color:var(--ink-soft)">Thanks. We'll email you within a few days with a tutor match. Keep an eye on your inbox, and check spam just in case.</p>
      <div class="cluster" style="justify-content:center;margin-top:1.75rem">
        <a class="btn btn--ghost" href="index.html">Back to home</a>
        <button class="link-gold" type="button" data-restart>Send another request</button>
      </div>
    </div>`;

  const panels = [...root.querySelectorAll("[data-panel]")];
  const elCount = root.querySelector("[data-count]");
  const elDots = [...root.querySelectorAll("[data-dots] li")];
  const elErr = root.querySelector("[data-err]");
  const elBack = root.querySelector("[data-back]");
  const elNext = root.querySelector("[data-next]");
  const elChrome = [root.querySelector(".reqflow__progress"), root.querySelector(".reqflow__steps"), elErr, root.querySelector(".reqflow__nav")];
  const elSuccess = root.querySelector("[data-success-panel]");

  function showErr(msg) { elErr.textContent = msg; elErr.classList.add("show"); }
  function hideErr() { elErr.classList.remove("show"); elErr.textContent = ""; }

  function goTo(i) {
    cur = i;
    panels.forEach((p, idx) => {
      const active = idx === i;
      p.hidden = !active;
      if (active) { p.classList.remove("is-active"); void p.offsetWidth; p.classList.add("is-active"); }
    });
    elCount.textContent = "Step " + (i + 1) + " of " + TOTAL;
    elDots.forEach((d, idx) => { d.className = idx < i ? "done" : (idx === i ? "current" : ""); });
    elBack.hidden = i === 0;
    elNext.innerHTML = (i === TOTAL - 1 ? "Send my request " : "Continue ") + ARROW;
    hideErr();
    const q = panels[i].querySelector(".reqflow__q");
    if (q) q.focus();
  }

  function validate(i) {
    const k = steps[i].key;
    if (k === "grade")   return root.querySelector('input[name="rf-grade"]:checked')  ? true : "Pick a grade to continue.";
    if (k === "subject") return root.querySelector('input[name="rf-subject"]:checked') ? true : "Pick a subject to continue.";
    if (k === "availability") return true;
    if (k === "format")  return root.querySelector('input[name="rf-format"]:checked') ? true : "Choose how you'd like to meet.";
    if (k === "details") {
      if (!val("#rf-student").trim()) return "Add the student's first name.";
      const email = val("#rf-email").trim();
      if (!email || !emailRe.test(email)) return "Enter a valid email so we can reach you.";
      return true;
    }
    return true;
  }

  function collect() {
    const gr = root.querySelector('input[name="rf-grade"]:checked');
    const su = root.querySelector('input[name="rf-subject"]:checked');
    const fo = root.querySelector('input[name="rf-format"]:checked');
    let subject = su ? su.value : "";
    if (subject === "__other") subject = val("#rf-subject-other").trim() || OTHER_FALLBACK;
    return {
      student: val("#rf-student").trim(),
      grade: gr ? gr.value : "",
      subject: subject,
      format: fo ? fo.value : "",
      email: val("#rf-email").trim(),
      availability: [...root.querySelectorAll('input[name="rf-avail"]:checked')].map(i => i.value).join(", "),
      notes: val("#rf-notes").trim()
    };
  }

  /* No cloud backend? Deliver the lead by email while we still have the gesture. */
  function emailFallback(data) {
    const c = window.HLA.store.content();
    const to = c.contact && c.contact.email; if (!to) return;
    const LABELS = { student: "Student", grade: "Grade", subject: "Subject", format: "Format", email: "Email", availability: "Availability", notes: "Notes" };
    const body = "New tutoring request from the HLA site:\n\n"
      + Object.keys(data).filter(k => data[k]).map(k => (LABELS[k] || k) + ": " + data[k]).join("\n");
    const a = document.createElement("a");
    a.href = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent("Tutoring request: " + (data.student || "new student")) + "&body=" + encodeURIComponent(body);
    a.click();
  }

  async function submit() {
    const data = collect();
    const orig = elNext.innerHTML;
    elNext.disabled = true; elBack.disabled = true; elNext.textContent = "Sending…";
    if (window.HLA.store.backend === "local") { try { emailFallback(data); } catch (e) {} }
    let sent = true;
    try { await window.HLA.store.submit("request", data); }
    catch (err) {
      sent = false;
      try {
        const q = JSON.parse(localStorage.getItem("hla_submissions") || "[]");
        q.push(Object.assign({ kind: "request", created_at: new Date().toISOString() }, data));
        localStorage.setItem("hla_submissions", JSON.stringify(q));
      } catch (e) {}
    }
    elNext.disabled = false; elBack.disabled = false; elNext.innerHTML = orig;
    if (!sent) {
      const c = window.HLA.store.content();
      const to = (c.contact && c.contact.email) || "";
      elErr.innerHTML = 'That did not send. Please email us at <a class="link-gold" href="mailto:' + to + '">' + to + '</a> and we will pick it up from there.';
      elErr.classList.add("show");
      // role="alert" already announces the message; hand keyboard focus to the
      // mailto link (not the whole <p>, which would re-read it).
      const link = elErr.querySelector("a"); if (link) link.focus();
      return;
    }
    elChrome.forEach(el => { if (el) el.hidden = true; });
    elSuccess.hidden = false;
    const h = elSuccess.querySelector("h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
  }

  function onNext() {
    const v = validate(cur);
    if (v !== true) { showErr(v); return; }
    if (cur === TOTAL - 1) { submit(); return; }
    goTo(cur + 1);
  }

  elNext.addEventListener("click", onNext);
  elBack.addEventListener("click", () => { if (cur > 0) goTo(cur - 1); });
  root.addEventListener("submit", (e) => { e.preventDefault(); onNext(); });
  /* The form has no submit button and several text fields, so Enter won't
     implicitly submit. Advance/submit explicitly from any text-type field. */
  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target && e.target.matches &&
        e.target.matches('input:not([type="radio"]):not([type="checkbox"])')) {
      e.preventDefault(); onNext();
    }
  });

  /* Subject "Other" reveals its text input */
  root.addEventListener("change", (e) => {
    if (e.target && e.target.name === "rf-subject") {
      const other = root.querySelector("[data-other]");
      if (other) other.hidden = e.target.value !== "__other";
      if (e.target.value === "__other") { const t = root.querySelector("#rf-subject-other"); if (t) t.focus(); }
    }
    if (elErr.classList.contains("show")) hideErr();
  });

  root.querySelector("[data-restart]").addEventListener("click", () => {
    root.querySelectorAll("input, textarea").forEach(el => {
      if (el.type === "radio" || el.type === "checkbox") el.checked = false; else el.value = "";
    });
    const other = root.querySelector("[data-other]"); if (other) other.hidden = true;
    elSuccess.hidden = true;
    elChrome.forEach(el => { if (el) el.hidden = false; });
    goTo(0);
  });

  /* Go live: show the flow, retire the no-JS fallback. Done last, so any error
     above leaves the plain form visible instead of a blank section. */
  goTo(0);
  root.hidden = false;
  fallback.hidden = true;
  const fallbackSuccess = fallback.parentNode.querySelector("[data-success]");
  if (fallbackSuccess) fallbackSuccess.hidden = true;
})();
