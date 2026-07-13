/* ============================================================
   HLA — Native form handling (request + tutor application)
   Validates, submits through the store, shows a success state.
   ============================================================ */
(function () {
  "use strict";

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function fieldOf(el) { return el.closest(".field"); }

  function validateField(field) {
    if (!field) return true;
    const input = field.querySelector("input, select, textarea");
    if (!input) return true;
    let ok = true;

    // radio group
    if (input.type === "radio") {
      const name = input.name;
      const group = field.querySelectorAll('input[name="' + name + '"]');
      const required = [...group].some(r => r.required);
      ok = !required || [...group].some(r => r.checked);
    } else {
      if (input.required && !input.value.trim()) ok = false;
      else if (input.type === "email" && input.value && !emailRe.test(input.value.trim())) ok = false;
    }
    field.classList.toggle("invalid", !ok);
    return ok;
  }

  function gather(form) {
    const data = {};
    form.querySelectorAll("input, select, textarea").forEach(el => {
      if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
      else if (el.name) data[el.name] = el.value.trim();
    });
    return data;
  }

  const LABELS = {
    student: "Student", name: "Name", grade: "Grade", subject: "Subject", subjects: "Subjects",
    format: "Format", email: "Email", phone: "Phone", school: "School & grade",
    availability: "Availability", notes: "Notes", why: "Why they want to tutor"
  };

  // No cloud backend? Route the lead to a real inbox so it is never silently dropped.
  function emailFallback(kind, data) {
    const c = window.HLA.store.content();
    const to = c.contact && c.contact.email;
    if (!to) return;
    const subject = kind === "tutor"
      ? "Tutor application: " + (data.name || "new applicant")
      : "Tutoring request: " + (data.student || "new student");
    const body = (kind === "tutor" ? "New tutor application from the HLA site:\n\n" : "New tutoring request from the HLA site:\n\n")
      + Object.keys(data).filter(k => data[k]).map(k => (LABELS[k] || k) + ": " + data[k]).join("\n");
    const a = document.createElement("a");
    a.href = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    a.click();
  }

  function wire(form) {
    const kind = form.getAttribute("data-hla-form");
    const card = form.closest(".form-card");
    const success = card ? card.querySelector("[data-success]") : null;
    const submitBtn = form.querySelector('[type="submit"]');

    // inline validation on blur
    form.querySelectorAll("input, select, textarea").forEach(el => {
      el.addEventListener("blur", () => { if (fieldOf(el)) validateField(fieldOf(el)); });
      el.addEventListener("input", () => {
        const f = fieldOf(el);
        if (f && f.classList.contains("invalid")) validateField(f);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll(".field")];
      let allOk = true, firstBad = null;
      fields.forEach(f => {
        const ok = validateField(f);
        if (!ok && !firstBad) firstBad = f;
        allOk = allOk && ok;
      });
      if (!allOk) {
        if (firstBad) {
          const inp = firstBad.querySelector("input, select, textarea");
          if (inp) inp.focus();
          firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending…";

      const data = gather(form);
      // With no cloud backend, deliver the lead by email while we still have the click gesture.
      if (window.HLA.store.backend === "local") emailFallback(kind, data);
      try {
        await window.HLA.store.submit(kind, data);
      } catch (err) {
        // store falls back to local; only a hard failure lands here
        console.warn("submit issue", err);
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = original;

      if (success) {
        form.style.display = "none";
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    // reset to submit again
    if (card) {
      const reset = card.querySelector("[data-reset]");
      if (reset) reset.addEventListener("click", () => {
        form.reset();
        form.querySelectorAll(".field.invalid").forEach(f => f.classList.remove("invalid"));
        if (success) success.classList.remove("show");
        form.style.display = "";
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  function init() { document.querySelectorAll("[data-hla-form]").forEach(wire); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
