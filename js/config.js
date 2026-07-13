/* ============================================================
   HLA — Config: editable content defaults, backend config,
   shared SVG (logo + icons), nav + footer definitions.
   The admin panel edits CONTENT; pages read it through the store.
   ============================================================ */

/* ---- Backend (optional). Leave blank to run on localStorage.
   Fill these in to make admin edits + form/hours data global.
   See README.md for the one-time Supabase setup. ---- */
window.HLA_SUPABASE = {
  url: "",        // e.g. https://xxxx.supabase.co
  anonKey: ""     // the anon / public key
};

/* ---- Editable content (defaults). Admin overrides are merged on top. ---- */
window.HLA_DEFAULTS = {
  org: "Honors Learning Academy",
  shortName: "HLA",

  announce: { on: false, text: "" },

  stats: [
    { value: "8",     label: "Subjects & tracks",   note: "core plus specialized" },
    { value: "K–12", label: "Grades served",     note: "every level, every pace" },
    { value: "100%",  label: "Free, always",         note: "no fees, no catch" },
    { value: "Both",  label: "Online & in person",   note: "near Waxhaw, NC" }
  ],

  contact: {
    email: "honorslearningacademy@gmail.com",
    phone: "",   // optional; blank hides it everywhere
    location: "Waxhaw · Marvin, North Carolina"
  },

  socials: {
    instagram: "", tiktok: "", youtube: "", x: "", linkedin: ""
  },

  /* Native forms post through the store. These are kept as a fallback
     if you'd rather route to existing Google Forms. */
  forms: {
    requestFallbackUrl: "",   // optional Google Form URL for tutoring requests
    tutorFallbackUrl: ""      // optional Google Form URL for tutor applications
  },

  founders: "Founded by Ishaan Dasari and Aksshat Shrikant, students at Marvin Ridge High School in Waxhaw, North Carolina",

  mission: "We started Honors Learning Academy on a simple idea: good tutoring is usually expensive, and it shouldn't be. We're students who do well in school and want the kids coming up after us to do well too. So we tutor them for free, online or in person around Waxhaw, and we plan to keep it that way as we grow."
};

/* ---- Team roster (code config, not CMS). Leave empty to hide the
   homepage team section. Admin saves never touch this array.
   Example entry (do not ship placeholders as real people):
   {
     name: "First Last",
     role: "Co-Founder & Co-Executive Director",
     bio: "One sentence, about fourteen to twenty words, on what they do here.",
     photo: "firstname.jpg",   // file in assets/team/, or "" for monogram
     link: ""                  // optional; omit the field if unused
   }
*/
window.HLA_TEAM = [
  { name: "Ishaan Dasari",    role: "Co-Founder",              bio: "", photo: "" },
  { name: "Aksshat Shrikant", role: "Co-Founder",              bio: "", photo: "" },
  { name: "Sohan Narala",     role: "Operations & Logistics",  bio: "", photo: "" },
  { name: "Shaurya Gautum",   role: "Operations & Logistics",  bio: "", photo: "" },
  { name: "Pranit Pradhan",   role: "Outreach & Social Media", bio: "", photo: "" },
  { name: "Akhil Chavali",    role: "Curriculum",              bio: "", photo: "" },
  { name: "Anish Premnath",   role: "Technology & Web",        bio: "", photo: "" }
];

/* ---- Shared SVG ---- */
window.HLA_LOGO = `
<svg class="brand__mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="3.25" y="3.25" width="41.5" height="41.5" rx="12" stroke="currentColor" stroke-width="1.5" opacity="0.32"/>
  <path d="M24 19.6 C 19.6 17, 14 17, 10.2 18.7 L 10.2 31.8 C 14 30.1, 19.6 30.1, 24 32.7"
        stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M24 19.6 C 28.4 17, 34 17, 37.8 18.7 L 37.8 31.8 C 34 30.1, 28.4 30.1, 24 32.7"
        stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <line x1="24" y1="19.6" x2="24" y2="32.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 7.6 L25.15 10.75 L28.4 11.9 L25.15 13.05 L24 16.2 L22.85 13.05 L19.6 11.9 L22.85 10.75 Z" fill="#B0822F"/>
</svg>`;

/* Crest seal: same open book + gold star as HLA_LOGO, inside a double
   ring. Paths only (no <text>), so nav and favicon match. Recolor via
   currentColor; gold via CSS var. Use .crest--invert on navy. */
window.HLA_CREST = `
<svg class="crest__svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
  <circle cx="32" cy="32" r="25.5" stroke="var(--gold, #B0822F)" stroke-width="1.25"/>
  <path d="M32 13.5 L33.5 17.5 L37.5 19 L33.5 20.5 L32 24.5 L30.5 20.5 L26.5 19 L30.5 17.5 Z"
        fill="var(--gold, #B0822F)"/>
  <g transform="translate(32 39) scale(1.6) translate(-12 -12)"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 6.5C9.5 4.8 6 4.8 3.5 6v12c2.5-1.2 6-1.2 8.5.5 2.5-1.7 6-1.7 8.5-.5V6c-2.5-1.2-6-1.2-8.5.5z"/>
    <path d="M12 6.5V19"/>
  </g>
</svg>`;

window.HLA_ICONS = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C9.5 4.8 6 4.8 3.5 6v12c2.5-1.2 6-1.2 8.5.5 2.5-1.7 6-1.7 8.5-.5V6c-2.5-1.2-6-1.2-8.5.5zM12 6.5V19"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6.5L5.2 17.6A2 2 0 0 0 7 20.6h10a2 2 0 0 0 1.8-3L14 9.5V3M8.2 14h7.6"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zm14 0l-2.5 6a3 3 0 0 0 5 0L19 7zM8 5l8-1.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 5.5a5 5 0 0 0-7.5.5 5 5 0 0 0-7.5-.5c-2 2-2 5 0 7L12 20l7.5-7.5c2-2 2-5 0-7z"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h4"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3.2 3.2 0 0 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/></svg>'
};

window.HLA_SOCIAL_ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.3 1.7 3.9 4 4.1V10c-1.5.1-2.8-.3-4-1v6.2c0 4-3.2 6.4-6.7 5.4-2.6-.7-3.9-3.4-3.2-6 .6-2.2 2.7-3.6 5.1-3.3v3c-.5-.1-1-.1-1.5.1-1 .4-1.5 1.4-1.2 2.4.3 1 1.4 1.6 2.5 1.2 1-.3 1.5-1.1 1.5-2.3V3h3.5z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="m10.5 9.5 4.5 2.5-4.5 2.5z" fill="currentColor" stroke="none"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.2L8 21H5l7.4-8.5L4.5 3h6.5l4.5 5.7L17.5 3zm-1.1 16h1.7L8 5h-1.8l10.2 14z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7M7 7v.01M11.5 17v-4a2 2 0 0 1 4 0v4M11.5 17v-7"/></svg>'
};

/* ---- Nav links (per audience). ---- */
window.HLA_NAV = [
  { href: "index.html",    label: "Home" },
  { href: "students.html", label: "For Families" },
  { href: "tutors.html",   label: "Become a Tutor" },
  { href: "portal.html",   label: "Log Hours" }
];
