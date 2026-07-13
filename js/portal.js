/* ============================================================
   HLA — Members Portal: guided hours logger + dashboard
   A friendly step flow (no API needed). Quick replies use a
   dedicated handler so a button label never becomes your name.
   ============================================================ */
(function () {
  "use strict";

  const log = document.getElementById("chatLog");
  const quick = document.getElementById("chatQuick");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");
  if (!log) return;

  const draft = { name: "", hours: 0, subject: "", date: "" };
  let state = "name";

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

  /* ---- dashboard ---- */
  async function renderDash(name) {
    const totalEl = document.getElementById("dashTotal");
    const subEl = document.getElementById("dashSub");
    const listEl = document.getElementById("dashSessions");
    if (!totalEl) return;
    const { total, sessions } = await window.HLA.store.getHours(name);
    totalEl.innerHTML = total + '<span>hrs</span>';
    subEl.textContent = name ? (sessions.length + " session" + (sessions.length === 1 ? "" : "s") + " logged for " + name) : "Log a session to see your total";
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

  /* ---- flow ---- */
  function askConfirm() {
    bot(`Got it. Logging ${draft.hours} hour${draft.hours === 1 ? "" : "s"} of ${draft.subject} on ${draft.date}, under ${draft.name}. Look right?`, 250);
    setTimeout(() => setQuick([
      { label: "Yes, log it", action: confirmYes },
      { label: "Start over", action: restart }
    ]), 500);
  }

  async function confirmYes() {
    user("Yes, log it");
    state = "saving";
    let res;
    try { res = await window.HLA.store.logHours({ name: draft.name, hours: draft.hours, subject: draft.subject, date: draft.date }); }
    catch (e) { bot("Something hiccuped saving that. Mind trying once more?", 200); state = "confirm"; askConfirm(); return; }
    bot(`Done. You're now at ${res.total} hour${res.total === 1 ? "" : "s"} total. Nice work.`, 250);
    renderDash(draft.name);
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
    bot(`Sure. How many hours this time, ${draft.name}?`, 250);
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
    bot(`No problem. How many hours did you tutor, ${draft.name}?`, 250);
  }

  function handleText(raw) {
    const text = (raw || "").trim();
    if (!text) return;

    if (state === "name") {
      draft.name = text;
      user(text);
      renderDash(draft.name);
      bot(`Hi ${draft.name}. How many hours did you tutor?`, 250);
      bot("You can say something like 1.5, or 90 minutes.", 600);
      state = "hours";
      return;
    }
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
      // treat as a new session's hours under same name
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

  // kick off
  bot("Welcome to the HLA members portal. What's your name?", 300);
  renderDash("");
})();
