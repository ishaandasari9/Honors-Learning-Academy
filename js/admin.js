/* ============================================================
   HLA — Admin editor (manual, no API key)
   Gate is client-side: it keeps casual visitors out, not a
   determined attacker. Nothing sensitive lives here. Change the
   key below, and use Supabase Row Level Security for real control.
   ============================================================ */
(function () {
  "use strict";

  /* Real auth. The gate is Supabase, not a string in this file: a secret
     shipped to the browser is not a secret. RLS on site_content only lets a
     signed-in user write, so an unauthenticated visitor can read the site
     but cannot change a word of it. */

  const lock = document.getElementById("adminLock");
  const shell = document.getElementById("adminShell");
  const emailInput = document.getElementById("adminEmail");
  const passInput = document.getElementById("adminPass");
  const keyBtn = document.getElementById("adminEnter");
  const keyErr = document.getElementById("adminKeyErr");

  function unlock() {
    lock.style.display = "none";
    shell.classList.add("show");
    populate();
  }

  if (window.HLA.auth.signedIn()) unlock();

  keyBtn.addEventListener("click", signIn);
  [emailInput, passInput].forEach(el => {
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") signIn(); });
  });

  async function signIn() {
    const original = keyBtn.innerHTML;
    keyBtn.disabled = true;
    keyBtn.innerHTML = "Signing in\u2026";
    try {
      await window.HLA.auth.signIn(emailInput.value.trim(), passInput.value);
      keyErr.style.display = "none";
      passInput.value = "";
      unlock();
    } catch (e) {
      keyErr.style.display = "block";
      passInput.value = "";
      passInput.focus();
    }
    keyBtn.disabled = false;
    keyBtn.innerHTML = original;
  }

  /* ---- tabs ---- */
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById("panel-" + tab.dataset.tab);
      panel.classList.add("active");
      if (tab.dataset.tab === "text") loadText();
      if (tab.dataset.tab === "submissions") loadSubmissions();
      if (tab.dataset.tab === "hours") loadHours();
    });
  });

  const $ = (id) => document.getElementById(id);

  const TEXT_PAGES = [
    { file: "index.html", label: "Home page" },
    { file: "students.html", label: "For Families page" },
    { file: "tutors.html", label: "Become a Tutor page" },
    { file: "portal.html", label: "Log Hours page" },
    { file: "privacy.html", label: "Privacy page" }
  ];
  let editsDraft = {};

  async function populate() {
    await window.HLA.store.loadContent();
    const c = window.HLA.store.content();
    editsDraft = Object.assign({}, c.edits || {});

    // backend chip
    const chip = $("backendChip");
    if (window.HLA.store.backend === "supabase") { chip.textContent = "Saving to the cloud (Supabase)"; chip.classList.remove("local"); }
    else { chip.textContent = "Saving to this browser only"; chip.classList.add("local"); }

    // content
    $("f-org").value = c.org || "";
    $("f-mission").value = c.mission || "";
    $("f-founders").value = c.founders || "";
    $("f-announce-on").checked = !!(c.announce && c.announce.on);
    $("f-announce-text").value = (c.announce && c.announce.text) || "";

    // stats
    const host = $("statsEditor");
    host.innerHTML = c.stats.map((s, i) => `
      <div class="form-grid" style="grid-template-columns:1fr 1.2fr 1.4fr;gap:.75rem;margin-bottom:.5rem">
        <div class="field"><label>Value</label><input data-stat="${i}-value" value="${esc(s.value)}" /></div>
        <div class="field"><label>Label</label><input data-stat="${i}-label" value="${esc(s.label)}" /></div>
        <div class="field"><label>Note</label><input data-stat="${i}-note" value="${esc(s.note)}" /></div>
      </div>`).join("");

    // contact + social
    $("f-email").value = c.contact.email || "";
    $("f-phone").value = (c.contact && c.contact.phone) || "";
    $("f-location").value = c.contact.location || "";
    ["instagram", "tiktok", "youtube", "x", "linkedin"].forEach(k => { $("f-soc-" + k).value = (c.socials && c.socials[k]) || ""; });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function roleLabel(el) {
    const t = el.tagName.toLowerCase();
    if (el.classList.contains("eyebrow")) return "Label";
    if (el.classList.contains("lede") || el.classList.contains("pullquote")) return "Intro text";
    if (el.classList.contains("faq__body")) return "Answer";
    if (t === "h1") return "Main heading";
    if (t === "h2") return "Section heading";
    if (t === "h3" || t === "h4" || t === "h5") return "Subheading";
    if (t === "li") return "List item";
    if (t === "dd" || t === "dt") return "Detail";
    return "Text";
  }

  async function loadText() {
    const host = $("textEditor");
    if (host.dataset.loaded === "1") return;
    host.innerHTML = '<div class="data-empty">Loading every line of text on the site…</div>';
    const cms = window.HLA.cms;
    let html = "";
    for (const pg of TEXT_PAGES) {
      let doc;
      try {
        const r = await fetch(pg.file);
        doc = new DOMParser().parseFromString(await r.text(), "text/html");
      } catch (e) { continue; }
      const main = doc.querySelector("main"); if (!main) continue;
      const els = cms.editTargets(doc);
      if (!els.length) continue;
      html += `<div class="admin-section"><h3>${pg.label}</h3>`;
      els.forEach(el => {
        const key = pg.file + "#" + cms.domPath(el, main);
        const def = cms.htmlToEdit(el);
        const cur = editsDraft[key] != null ? editsDraft[key] : def;
        const field = def.length > 58
          ? `<textarea data-ekey="${esc(key)}" data-def="${esc(def)}" rows="2">${esc(cur)}</textarea>`
          : `<input type="text" data-ekey="${esc(key)}" data-def="${esc(def)}" value="${esc(cur)}" />`;
        html += `<div class="field"><label>${roleLabel(el)}</label>${field}</div>`;
      });
      html += `</div>`;
    }
    host.innerHTML = html || '<div class="data-empty">No editable text found.</div>';
    host.querySelectorAll("[data-ekey]").forEach(inp => {
      inp.addEventListener("input", () => {
        const k = inp.getAttribute("data-ekey"), d = inp.getAttribute("data-def");
        if (inp.value === d) delete editsDraft[k]; else editsDraft[k] = inp.value;
      });
    });
    host.dataset.loaded = "1";
  }

  function gather() {
    const c = window.HLA.store.content();
    const statCount = c.stats.length;
    const stats = [];
    for (let i = 0; i < statCount; i++) {
      stats.push({
        value: document.querySelector(`[data-stat="${i}-value"]`).value,
        label: document.querySelector(`[data-stat="${i}-label"]`).value,
        note: document.querySelector(`[data-stat="${i}-note"]`).value
      });
    }
    return Object.assign({}, c, {
      org: $("f-org").value.trim() || "Honors Learning Academy",
      mission: $("f-mission").value.trim(),
      founders: $("f-founders").value.trim(),
      announce: { on: $("f-announce-on").checked, text: $("f-announce-text").value.trim() },
      stats,
      contact: {
        email: $("f-email").value.trim(),
        phone: $("f-phone").value.trim(),
        location: $("f-location").value.trim()
      },
      socials: {
        instagram: $("f-soc-instagram").value.trim(),
        tiktok: $("f-soc-tiktok").value.trim(),
        youtube: $("f-soc-youtube").value.trim(),
        x: $("f-soc-x").value.trim(),
        linkedin: $("f-soc-linkedin").value.trim()
      },
      edits: editsDraft
    });
  }

  document.querySelectorAll("[data-save]").forEach(btn => btn.addEventListener("click", save));
  async function save() {
    const flash = $("savedFlash");
    const obj = gather();
    try {
      await window.HLA.store.saveContent(obj);
      flash.textContent = window.HLA.store.backend === "supabase" ? "Saved to the cloud" : "Saved to this browser";
      flash.classList.add("show");
    } catch (e) {
      const msg = String(e);
      if (msg.indexOf("401") > -1 || msg.indexOf("403") > -1) {
        window.HLA.auth.signOut();
        flash.textContent = "Session expired. Reload and sign in again.";
      } else {
        flash.textContent = "Cloud save failed; kept a local copy";
      }
      flash.classList.add("show");
    }
    setTimeout(() => flash.classList.remove("show"), 2600);
  }

  /* ---- submissions ---- */
  async function loadSubmissions() {
    const host = $("submissionsTable");
    if (window.HLA.store.backend === "supabase") {
      host.innerHTML = '<div class="data-empty">For families’ privacy, tutoring requests and applications are not readable with the public site key. View them in your Supabase dashboard under <strong>Table editor &rarr; submissions</strong>.</div>';
      return;
    }
    host.innerHTML = '<div class="data-empty">Loading…</div>';
    const rows = await window.HLA.store.allSubmissions();
    if (!rows.length) { host.innerHTML = '<div class="data-empty">No form submissions yet. Requests and tutor applications will show up here.</div>'; return; }
    host.innerHTML = `<div class="table-scroll"><table class="data-table">
      <thead><tr><th>When</th><th>Type</th><th>Name</th><th>Contact</th><th>Details</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td>${fmtDate(r.created_at)}</td>
        <td>${r.kind === "tutor" ? "Tutor" : "Request"}</td>
        <td>${esc(r.name || r.student || "")}</td>
        <td>${esc(r.email || "")}</td>
        <td>${esc(detail(r))}</td>
      </tr>`).join("")}</tbody></table></div>`;
  }
  function detail(r) {
    if (r.kind === "tutor") return [r.school, r.subjects, r.format, r.availability].filter(Boolean).join(" · ");
    return [r.grade, r.subject, r.format, r.availability, r.notes].filter(Boolean).join(" · ");
  }

  /* ---- hours ---- */
  async function loadHours() {
    const host = $("hoursTable");
    host.innerHTML = '<div class="data-empty">Loading…</div>';
    const rows = await window.HLA.store.allHours();
    if (!rows.length) { host.innerHTML = '<div class="data-empty">No hours logged yet.</div>'; return; }
    const totals = {};
    rows.forEach(r => { const k = (r.name || "").trim(); totals[k] = (totals[k] || 0) + (parseFloat(r.hours) || 0); });
    const grand = Object.values(totals).reduce((a, b) => a + b, 0);
    host.innerHTML = `
      <p style="margin-bottom:1rem;color:var(--ink-soft)"><strong>${Math.round(grand * 10) / 10}</strong> total hours across <strong>${Object.keys(totals).length}</strong> members.</p>
      <div class="table-scroll"><table class="data-table">
      <thead><tr><th>When</th><th>Member</th><th>Subject</th><th>Hours</th><th>Session date</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <td>${fmtDate(r.created_at)}</td>
        <td>${esc(r.name || "")}</td>
        <td>${esc(r.subject || "")}</td>
        <td>${parseFloat(r.hours) || 0}</td>
        <td>${esc(r.date || "")}</td>
      </tr>`).join("")}</tbody></table></div>`;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
})();
