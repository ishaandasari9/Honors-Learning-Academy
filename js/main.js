/* ============================================================
   HLA — Shared runtime
   - store: content + submissions + hours (Supabase or localStorage)
   - UI: nav, footer, mobile menu, scroll reveals, content binding
   ============================================================ */
(function () {
  "use strict";

  const D = window.HLA_DEFAULTS;
  const SB = window.HLA_SUPABASE || { url: "", anonKey: "" };
  const hasSB = !!(SB.url && SB.anonKey);

  /* ---------- deep merge (objects only; arrays replaced) ---------- */
  function merge(base, over) {
    if (Array.isArray(base) || typeof base !== "object" || base === null) {
      return over === undefined ? base : over;
    }
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (over && typeof over === "object") {
      for (const k of Object.keys(over)) out[k] = merge(base[k], over[k]);
    }
    return out;
  }

  /* ---------- Supabase REST helper ---------- */
  /* An admin who has signed in gets a session token. Everyone else rides on
     the public anon key. RLS decides what each of them is allowed to do. */
  const TOKEN_KEY = "hla_sb_token";
  function authToken() {
    try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }

  const auth = {
    signedIn() { return !!authToken(); },
    signOut() { try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} },
    async signIn(email, password) {
      const res = await fetch(SB.url + "/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { "apikey": SB.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
      });
      if (!res.ok) throw new Error("Sign in failed " + res.status);
      const j = await res.json();
      if (!j.access_token) throw new Error("Sign in failed");
      sessionStorage.setItem(TOKEN_KEY, j.access_token);
      return true;
    }
  };

  async function sb(path, opts = {}) {
    const res = await fetch(SB.url + "/rest/v1/" + path, Object.assign({}, opts, {
      headers: Object.assign({
        "apikey": SB.anonKey,
        "Authorization": "Bearer " + (authToken() || SB.anonKey),
        "Content-Type": "application/json"
      }, opts.headers || {})
    }));
    if (!res.ok) throw new Error("Supabase " + res.status);
    const txt = await res.text();
    return txt ? JSON.parse(txt) : null;
  }

  /* ---------- local storage helpers ---------- */
  const LS = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- content (cached) ---------- */
  let _content = null;

  const store = {
    backend: hasSB ? "supabase" : "local",

    async loadContent() {
      let over = LS.get("hla_content", null);
      if (hasSB) {
        try {
          const rows = await sb("site_content?id=eq.1&select=data");
          if (rows && rows[0] && rows[0].data) over = rows[0].data;
        } catch (e) { /* fall back to local/defaults */ }
      }
      _content = merge(D, over || {});
      return _content;
    },

    content() { return _content || merge(D, LS.get("hla_content", {}) || {}); },

    async saveContent(obj) {
      LS.set("hla_content", obj);
      _content = merge(D, obj);
      if (hasSB) {
        await sb("site_content?id=eq.1", {
          method: "PATCH",
          headers: { "Prefer": "return=minimal" },
          body: JSON.stringify({ data: obj })
        });
      }
      return _content;
    },

    async submit(kind, data) {
      const row = Object.assign({ kind, created_at: new Date().toISOString() }, data);
      if (hasSB) {
        await sb("submissions", { method: "POST", headers: { "Prefer": "return=minimal" }, body: JSON.stringify(row) });
      } else {
        const q = LS.get("hla_submissions", []); q.push(row); LS.set("hla_submissions", q);
      }
      return true;
    },

    async logHours(entry) {
      const row = Object.assign({ created_at: new Date().toISOString() }, entry);
      if (hasSB) {
        await sb("hours", { method: "POST", headers: { "Prefer": "return=minimal" }, body: JSON.stringify(row) });
      } else {
        const q = LS.get("hla_hours", []); q.push(row); LS.set("hla_hours", q);
      }
      return this.getHours(entry.name);
    },

    async allHours() {
      if (hasSB) { try { return (await sb("hours?select=*&order=created_at.desc")) || []; } catch { return []; } }
      return LS.get("hla_hours", []).slice().reverse();
    },

    async allSubmissions() {
      if (hasSB) { try { return (await sb("submissions?select=*&order=created_at.desc")) || []; } catch { return []; } }
      return LS.get("hla_submissions", []).slice().reverse();
    },

    async getHours(name) {
      let rows = [];
      if (hasSB) {
        try {
          rows = await sb("hours?select=name,hours,subject,date,created_at&order=created_at.desc") || [];
        } catch { rows = []; }
      } else {
        rows = LS.get("hla_hours", []);
      }
      const key = (name || "").trim().toLowerCase();
      const mine = rows.filter(r => (r.name || "").trim().toLowerCase() === key);
      const total = mine.reduce((s, r) => s + (parseFloat(r.hours) || 0), 0);
      mine.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));
      return { total: Math.round(total * 10) / 10, sessions: mine };
    }
  };

  /* ============================================================
     UI
     ============================================================ */
  const ICONS = window.HLA_ICONS, LOGO = window.HLA_LOGO, CREST = window.HLA_CREST,
        SOC = window.HLA_SOCIAL_ICONS, NAV = window.HLA_NAV;

  const SOCIAL_LABELS = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", x: "X", linkedin: "LinkedIn" };

  function currentPage() {
    const p = location.pathname.split("/").pop() || "index.html";
    return p === "" ? "index.html" : p;
  }

  function buildNav() {
    const host = document.querySelector("[data-nav]");
    if (!host) return;
    const here = currentPage();
    const links = NAV.map(n =>
      `<a class="nav__link${n.href === here ? " active" : ""}" href="${n.href}">${n.label}</a>`).join("");
    host.outerHTML = `
      <nav class="nav" id="siteNav" aria-label="Primary">
        <div class="wrap nav__inner">
          <a class="brand" href="index.html" aria-label="${D.org} home">
            <span class="crest crest--nav" aria-hidden="true">${CREST || LOGO}</span>
            <span>${D.shortName}<small>Honors Learning Academy</small></span>
          </a>
          <div class="nav__links" id="navLinks">
            ${links}
            <span class="nav__cta"><a class="btn btn--primary" href="students.html#request">Get a tutor ${ICONS.arrow}</a></span>
          </div>
          <button class="nav__burger" id="navBurger" aria-label="Menu" aria-expanded="false" aria-controls="navLinks"><span></span></button>
        </div>
      </nav>`;

    const nav = document.getElementById("siteNav");
    const burger = document.getElementById("navBurger");
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll("#navLinks a").forEach(a =>
      a.addEventListener("click", () => nav.classList.remove("open")));

    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  function socialRow(socials, cls) {
    return Object.keys(SOCIAL_LABELS).map(k => {
      const url = socials && socials[k];
      if (!url) return "";
      const href = /^https?:\/\//.test(url) ? url : "https://" + url;
      return `<a class="${cls || ""}" href="${href}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABELS[k]}">${SOC[k]}</a>`;
    }).join("");
  }

  function buildFooter() {
    const host = document.querySelector("[data-footer]");
    if (!host) return;
    const c = store.content();
    const year = new Date().getFullYear();
    const social = socialRow(c.socials, "");
    host.outerHTML = `
      <footer class="footer">
        <div class="wrap">
          <div class="footer__grid">
            <div class="footer__brand">
              <a class="brand" href="index.html"><span class="crest crest--footer crest--invert" aria-hidden="true">${CREST || LOGO}</span><span>${c.shortName}<small>Honors Learning Academy</small></span></a>
              <p style="margin-top:1rem;max-width:34ch;color:oklch(72% 0.02 84)">Free, peer-led tutoring for K–12 students. Online anywhere, or in person around Waxhaw, North Carolina.</p>
              ${social ? `<div class="footer__social">${social}</div>` : ""}
            </div>
            <div>
              <h4>Explore</h4>
              <ul style="list-style:none;display:grid;gap:.6rem">
                <li><a href="index.html">Home</a></li>
                <li><a href="students.html">For families</a></li>
                <li><a href="tutors.html">Become a tutor</a></li>
                <li><a href="portal.html">Log hours</a></li>
              </ul>
            </div>
            <div>
              <h4>Get started</h4>
              <ul style="list-style:none;display:grid;gap:.6rem">
                <li><a href="students.html#request">Request a tutor</a></li>
                <li><a href="tutors.html#apply">Apply to tutor</a></li>
                <li><a href="portal.html">Log volunteer hours</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul style="list-style:none;display:grid;gap:.6rem">
                <li><a href="mailto:${c.contact.email}">${c.contact.email}</a></li>
                ${(c.contact.phone || "").trim()
                  ? `<li><a href="tel:${escAttr(String(c.contact.phone).replace(/[^\d+]/g, ""))}">${escAttr(c.contact.phone)}</a></li>`
                  : ""}
                <li>${c.contact.location}</li>
              </ul>
            </div>
          </div>
          <div class="footer__bottom">
            <span>© ${year} ${c.org}. A student-founded nonprofit, 501(c)(3) status pending.</span>
            <span><a href="privacy.html">Privacy</a> · Built with care for students and families.</span>
          </div>
        </div>
      </footer>`;
  }

  function buildAnnounce() {
    const c = store.content();
    if (!c.announce || !c.announce.on || !c.announce.text) return;
    const bar = document.createElement("div");
    bar.className = "announce";
    bar.innerHTML = `<div class="wrap announce__inner"><span class="announce__dot"></span><p>${c.announce.text}</p></div>`;
    document.body.prepend(bar);
    document.body.classList.add("has-announce");
  }

  /* ---- bind [data-bind="dot.path"] text + special renderers ---- */
  function get(obj, path) { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj); }

  function applyContent() {
    const c = store.content();
    document.querySelectorAll("[data-bind]").forEach(el => {
      const v = get(c, el.getAttribute("data-bind"));
      if (v == null) return;
      if (el.tagName === "A" && el.dataset.bind.startsWith("contact.email")) {
        el.textContent = v; el.href = "mailto:" + v;
      } else { el.textContent = v; }
    });
    // generic mailto links keep their label, update href
    document.querySelectorAll("[data-mail]").forEach(a => { a.href = "mailto:" + c.contact.email; });
    // optional phone append on the index CTA fine print
    const phone = (c.contact && c.contact.phone || "").trim();
    document.querySelectorAll("[data-cta-phone]").forEach(slot => {
      if (!phone) { slot.textContent = ""; return; }
      const digits = phone.replace(/[^\d+]/g, "");
      slot.innerHTML = ` or call <a class="link-gold" href="tel:${escAttr(digits)}">${escAttr(phone)}</a>`;
    });
    // stats
    const statHost = document.querySelector("[data-stats]");
    if (statHost) {
      statHost.innerHTML = c.stats.map(s => `
        <div class="stat reveal">
          <div class="stat__value tabular">${s.value}</div>
          <div class="stat__label">${s.label}</div>
          <div class="stat__note">${s.note}</div>
        </div>`).join("");
    }
    applyEdits(c);
    renderTeam();
  }

  /* ---- Team section (homepage). Empty HLA_TEAM = section stays hidden. ---- */
  function initials(name) {
    return String(name || "").trim().split(/\s+/).filter(Boolean)
      .map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  }

  function renderTeam() {
    const section = document.querySelector("[data-team-section]");
    const host = document.querySelector("[data-team]");
    if (!section || !host) return;
    const team = Array.isArray(window.HLA_TEAM) ? window.HLA_TEAM.filter(m => m && m.name) : [];
    if (!team.length) {
      section.hidden = true;
      host.innerHTML = "";
      return;
    }
    section.hidden = false;
    host.innerHTML = team.map((m, i) => {
      const delay = i % 4;
      const delayAttr = delay ? ` data-delay="${delay}"` : "";
      const alt = `${m.name}, ${m.role || ""}`.replace(/,\s*$/, "");
      const photo = (m.photo || "").trim();
      const media = photo
        ? `<img class="team__photo" src="assets/team/${photo}" alt="${escAttr(alt)}" width="480" height="600" loading="lazy" />`
        : `<div class="team__mono" aria-hidden="true"><span>${escAttr(initials(m.name))}</span></div>`;
      const nameEl = m.link
        ? `<a class="team__name" href="${escAttr(m.link)}"${/^https?:\/\//.test(m.link) ? ' target="_blank" rel="noopener"' : ""}>${escAttr(m.name)}</a>`
        : `<span class="team__name">${escAttr(m.name)}</span>`;
      return `<article class="team__card reveal"${delayAttr}>
        <div class="team__media">${media}</div>
        ${nameEl}
        ${m.role ? `<span class="team__role">${escAttr(m.role)}</span>` : ""}
        ${m.bio ? `<p class="team__bio">${escAttr(m.bio)}</p>` : ""}
      </article>`;
    }).join("");
  }

  function escAttr(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---- hydrate data-ic + data-crest ---- */
  function hydrateMarks() {
    const I = window.HLA_ICONS || {};
    document.querySelectorAll("[data-ic]").forEach(el => {
      const k = el.getAttribute("data-ic");
      if (I[k]) el.innerHTML = I[k];
    });
    if (CREST) {
      document.querySelectorAll("[data-crest]").forEach(el => {
        if (!el.querySelector("svg")) el.innerHTML = CREST;
      });
    }
  }

  /* ---- Editable website text (lightweight CMS) ----
     Every heading/paragraph/label is addressable by its position in <main>,
     so the admin can edit any of it without keys in the HTML. */
  const EDIT_SELECTOR = "h1,h2,h3,h4,h5,p,li,blockquote,dd,dt,.eyebrow,.faq__body";
  function escEdit(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function editToHtml(s) { return escEdit(s).replace(/\*([^*]+)\*/g, '<span class="serif-accent">$1</span>'); }
  function htmlToEdit(el) {
    let out = "";
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) out += n.textContent;
      else if (n.nodeType === 1 && n.matches && n.matches("span.serif-accent")) out += "*" + n.textContent + "*";
      else if (n.nodeType === 1) out += n.textContent;
    });
    return out.replace(/\s+/g, " ").trim();
  }
  function isSimpleText(el) { return [...el.children].every(c => c.matches("span.serif-accent")); }
  function editTargets(doc) {
    const main = doc.querySelector("main"); if (!main) return [];
    return [...main.querySelectorAll(EDIT_SELECTOR)].filter(el => {
      if (el.closest("#chatLog,[data-stats],[data-team]")) return false;
      if (el.hasAttribute("data-bind") || el.hasAttribute("data-noedit")) return false;
      if (el.querySelector(EDIT_SELECTOR)) return false;
      if (!isSimpleText(el)) return false;
      return el.textContent.trim().length > 0;
    });
  }
  function domPath(el, root) {
    const parts = [];
    while (el && el !== root) {
      const p = el.parentNode; if (!p) break;
      parts.unshift(el.tagName.toLowerCase() + [...p.children].indexOf(el));
      el = p;
    }
    return parts.join("/");
  }
  function applyEdits(c) {
    if (!c.edits) return;
    const main = document.querySelector("main"); if (!main) return;
    const page = currentPage();
    editTargets(document).forEach(el => {
      const key = page + "#" + domPath(el, main);
      if (c.edits[key] != null) el.innerHTML = editToHtml(c.edits[key]);
    });
  }

  /* ---- scroll reveals ---- */
  function initReveals() {
    const els = [...document.querySelectorAll(".reveal:not(.in)")];
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(el => el.classList.add("in")); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    const vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      // already on screen at load: reveal now instead of waiting for a scroll
      if (r.top < vh * 0.94 && r.bottom > 0) el.classList.add("in");
      else io.observe(el);
    });
  }

  function reObserveReveals() { initReveals(); }

  /* ---- boot ---- */
  async function boot() {
    hydrateMarks();            // icons/crest first; does not depend on content
    initReveals();              // reveal static content immediately, independent of data load
    await store.loadContent();
    buildAnnounce();
    buildNav();
    buildFooter();
    applyContent();
    hydrateMarks();            // safety net for injected DOM (nav, footer, team, stats)
    initReveals();              // observe any newly injected reveals (e.g. stats, team)
    document.documentElement.classList.add("hla-ready");
  }

  window.HLA = {
    store, auth, ICONS, LOGO, CREST, socialRow, reObserveReveals, applyContent, SOCIAL_LABELS,
    cms: { editTargets, domPath, htmlToEdit, editToHtml }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
