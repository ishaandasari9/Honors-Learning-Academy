/* ============================================================
   HLA — Tutor hours logger + dashboard (auth-gated)
   Sign-in mirrors admin.js: real Supabase Auth, one auth pattern.
   Identity comes from the session; logged rows attach to the
   authenticated user id via RLS (the client never sends a name).
   ============================================================ */
(function () {
  "use strict";

  const log = document.getElementById("chatLog");
  const quick = document.getElementById("chatQuick");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");
  if (!log) return;

  const auth = window.HLA.auth;
  const draft = { hours: 0, subject: "", date: "" };
  let state = "hours";

  function todayStr() {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function bot(text, delay) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "msg msg--bot";
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }, delay || 200);
  }
  function user(text) {
    const el = document.createElement("div");
    el.className = "msg msg--user";
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }
  function setQuick(items) {
    quick.innerHTML = "";
    (items || []).forEach(it => {
      const b = document.createElement("button");
      b.className = "choice";
      b.type = "button";
      b.textContent = it.label;
      b.addEventListener("click", () => { quick.innerHTML = ""; it.action(); });
      quick.appendChild(b);
    });
  }

  function parseHours(raw) {
    const t = (raw || "").toLowerCase();
    const m = t.match(/(\d+(\.\d+)?)/);
    if (!m) return NaN;
    let n = parseFloat(m[1]);
    if (/min/.test(t)) n = n / 60;
    return Math.round(n * 100) / 100;
  }

  /* ---- dashboard (signed-in tutor's own rows, via RLS) ---- */
  async function renderDash() {
    const totalEl = document.getElementById("dashTotal");
    const subEl = document.getElementById("dashSub");
    const listEl = document.getElementById("dashSessions");
    if (!totalEl) return;
    const { total, sessions } = await window.HLA.store.getMyHours();
    totalEl.innerHTML = total + '<span>hrs</span>';
    subEl.textContent = sessions.length
      ? (sessions.length + " session" + (sessions.length === 1 ? "" : "s") + " logged")
      : "Log a session to see your total";
    if (!sessions.length) {
      listEl.innerHTML = '<div class="dash__empty">No sessions yet. Your logged hours will appear here.</div>';
      return;
    }
    listEl.innerHTML = sessions.slice(0, 8).map(s => `
      <div class="session">
        <div>
          <div class="session__main">${escapeHtml(s.subject || "Session")}</div>
          <div class="session__meta">${escapeHtml(s.date || "")}</div>
        </div>
        <div class="session__hrs tabular">${(parseFloat(s.hours) || 0)} hrs</div>
      </div>`).join("");
  }
  function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  /* ---- logging flow ---- */
  function askConfirm() {
    bot(`Got it. Logging ${draft.hours} hour${draft.hours === 1 ? "" : "s"} of ${draft.subject} on ${draft.date}. Look right?`, 250);
    setTimeout(() => setQuick([
      { label: "Yes, log it", action: confirmYes },
      { label: "Start over", action: restart }
    ]), 500);
  }

  async function confirmYes() {
    user("Yes, log it");
    state = "saving";
    let res;
    try { res = await window.HLA.store.logHours({ hours: draft.hours, subject: draft.subject, date: draft.date }); }
    catch (e) { bot("Something hiccuped saving that. Mind trying once more?", 200); state = "confirm"; askConfirm(); return; }
    bot(`Done. You're now at ${res.total} hour${res.total === 1 ? "" : "s"} total. Nice work.`, 250);
    renderDash();
    state = "done";
    setTimeout(() => setQuick([
      { label: "Log another session", action: logMore },
      { label: "I'm done", action: finish }
    ]), 600);
  }

  function logMore() {
    user("Log another session");
    draft.hours = 0; draft.subject = ""; draft.date = "";
    state = "hours";
    bot("Sure. How many hours this time?", 250);
  }
  function finish() {
    user("I'm done");
    bot("Anytime. Your hours are saved. See you next session.", 250);
    state = "ended";
  }
  function restart() {
    user("Start over");
    draft.hours = 0; draft.subject = ""; draft.date = "";
    state = "hours";
    bot("No problem. How many hours did you tutor?", 250);
  }

  function handleText(raw) {
    const text = (raw || "").trim();
    if (!text) return;

    if (state === "hours") {
      const h = parseHours(text);
      user(text);
      if (isNaN(h) || h <= 0) { bot("I didn't catch a number there. Try a number like 2 or 1.5.", 250); return; }
      draft.hours = h;
      bot("What subject did you tutor?", 250);
      state = "subject";
      return;
    }
    if (state === "subject") {
      draft.subject = text;
      user(text);
      bot("What day was the session? Tap today, or type a date.", 250);
      setTimeout(() => setQuick([{ label: "Today (" + todayStr() + ")", action: () => { draft.date = todayStr(); user("Today"); quick.innerHTML = ""; askConfirm(); state = "confirm"; } }]), 500);
      state = "date";
      return;
    }
    if (state === "date") {
      draft.date = text;
      user(text);
      quick.innerHTML = "";
      askConfirm();
      state = "confirm";
      return;
    }
    if (state === "confirm") {
      user(text);
      if (/^y/i.test(text)) confirmYes(); else restart();
      return;
    }
    if (state === "done" || state === "ended") {
      // treat as the start of a new session
      draft.hours = 0; draft.subject = ""; draft.date = "";
      state = "hours";
      handleText(text);
      return;
    }
  }

  function send() {
    const v = input.value;
    input.value = "";
    handleText(v);
  }
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); send(); } });

  /* ---- auth gate (real Supabase Auth, same pattern as admin.js) ---- */
  const lock = document.getElementById("hoursLock");
  const shell = document.getElementById("hoursShell");
  const emailInput = document.getElementById("hoursEmail");
  const passInput = document.getElementById("hoursPass");
  const enterBtn = document.getElementById("hoursEnter");
  const errEl = document.getElementById("hoursErr");
  const signoutBtn = document.getElementById("hoursSignout");
  const whoChip = document.getElementById("hoursWho");
  let started = false;

  function startLogger() {
    if (started) return;
    started = true;
    const u = auth.user && auth.user();
    if (whoChip) whoChip.textContent = (u && u.email) ? ("Signed in as " + u.email) : "Signed in";
    bot("Welcome back. How many hours did you tutor?", 300);
    bot("You can say something like 1.5, or 90 minutes.", 650);
    renderDash();
    state = "hours";
  }
  function unlock() {
    if (lock) lock.style.display = "none";
    if (shell) shell.classList.add("show");
    startLogger();
  }
  async function signIn() {
    if (!enterBtn) return;
    const original = enterBtn.innerHTML;
    enterBtn.disabled = true;
    enterBtn.innerHTML = "Signing in…";
    try {
      await auth.signIn(emailInput.value.trim(), passInput.value);
      if (errEl) errEl.style.display = "none";
      passInput.setAttribute("aria-invalid", "false");
      passInput.value = "";
      unlock();
      const ci = document.getElementById("chatInput"); // keep keyboard/SR focus in the revealed logger
      if (ci) ci.focus();
    } catch (e) {
      if (errEl) errEl.style.display = "block";
      passInput.setAttribute("aria-invalid", "true");
      passInput.value = "";
      passInput.focus();
    }
    enterBtn.disabled = false;
    enterBtn.innerHTML = original;
  }

  if (auth.signedIn()) {
    unlock();
  } else if (enterBtn) {
    enterBtn.addEventListener("click", signIn);
    [emailInput, passInput].forEach(el => el && el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); signIn(); } }));
  }
  if (signoutBtn) signoutBtn.addEventListener("click", () => { auth.signOut(); location.reload(); });
})();
