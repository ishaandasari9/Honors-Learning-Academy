# Honors Learning Academy — website

A five-page site for a student-founded nonprofit offering free K–12 tutoring.

| Page | File | What it is |
|---|---|---|
| Home | `index.html` | Landing page, the two-audience split, subjects, mission |
| For Families | `students.html` | Request-a-tutor form + FAQ |
| Become a Tutor | `tutors.html` | Perks + tutor application form |
| Members Portal | `portal.html` | Guided volunteer-hours logger + live total |
| Admin | `admin.html` | Edit site content (key-protected) |
| Privacy | `privacy.html` | Plain-language privacy statement |

Shared code lives in `css/` and `js/`. Content you can edit (stats, mission, founders, contact, socials, announcement) is in `js/config.js` and through the admin page. The team roster is separate: `window.HLA_TEAM` in `js/config.js` (not overwritten by admin saves).

---

## Team photos

Homepage team portraits live in `assets/team/`. Add people to `window.HLA_TEAM` in `js/config.js` (see the commented example there). The section stays hidden until the array has at least one person. Admin saves never touch this roster.

**Photo spec**

- 1200 × 1500, 4:5 portrait, JPEG or WebP, under 120KB after compression
- Faces framed consistently, similar lighting, plain or softly blurred background
- Filename `assets/team/firstname.jpg`, matched to the `photo` field in `HLA_TEAM`
- Only include someone who has agreed to appear. If they have not, leave `photo` empty and the monogram covers it.

Also see `assets/team/README.md`.

Phone is optional: leave Contact → Phone blank in admin (or `contact.phone: ""` in config) and it stays hidden everywhere.

---

## Before you launch: a 7-item checklist

The design is done. These are the things that make it *true* and safe:

1. **Connect a backend or you'll lose leads.** By default, forms and hours save only in the visitor's own browser. To actually receive tutoring requests and store hours, [connect Supabase](#connect-supabase-recommended). If you skip this, the request/apply forms fall back to opening a prefilled email to your contact address so leads still reach you, but Supabase is the real answer.
2. **Set a real contact email.** It currently shows `contact@honorslearningacademy.org`, which may not be a real inbox yet. Change it on the admin page (Contact & social) to an address you actually check. Every "email us" link and the no-backend form fallback use it.
3. **Change the admin key.** It's in `js/admin.js`, line ~13: `const ADMIN_KEY = "amv#09";`. Pick something only you know. (This keeps casual visitors out; it is not bank-grade security. See [Security notes](#security-notes).)
4. **Add your names.** On the admin page, fill the "Founders line" with real first names and your school. Parents trust a named group far more than an anonymous one.
5. **Fill the team roster.** Add real names, roles, and bios to `window.HLA_TEAM` in `js/config.js`, plus photos in `assets/team/` (or leave `photo` empty for monograms). Export a 180px `apple-touch-icon.png` from `assets/favicon.svg` when you can. Optional: add a phone number in admin (Contact); blank keeps it hidden.
6. **Pick the right contact email + announcement.** Optional: turn on the announcement bar for sign-up season.
7. **Read the [Security notes](#security-notes).** Especially the part about families' data.

---

## Deploy to GitHub + Vercel

You can upload the whole folder at once (easier than copy-pasting each file).

1. Create a new repository at [github.com/new](https://github.com/new). Don't add a README (you already have one).
2. On the repo page, click **uploading an existing file**, then drag in *everything in this folder* (the `.html` files plus the `css/` and `js/` folders). Keep the structure: the HTML files stay at the top level, `css/` and `js/` stay as folders.
3. Commit.
4. Go to [vercel.com](https://vercel.com), sign in with GitHub, **Add New → Project**, import the repo.
5. Framework preset: **Other**. Leave build command and output directory empty. Click **Deploy**.
6. You get a live URL in about 30 seconds. The homepage is `index.html`; the admin is at `your-site.vercel.app/admin.html`.

After this, any change you commit to GitHub redeploys automatically.

---

## Connect Supabase (recommended)

This makes form submissions, hours, and admin edits real and shared across everyone's devices.

1. In your Supabase project, open the **SQL Editor**, paste the block below, and click **Run**.

```sql
-- 1) Editable site content (one row)
create table if not exists site_content (
  id int primary key default 1,
  data jsonb not null default '{}',
  constraint one_row check (id = 1)
);
insert into site_content (id, data) values (1, '{}') on conflict (id) do nothing;
alter table site_content enable row level security;
create policy "anyone can read content" on site_content for select to anon using (true);
create policy "anyone can update content" on site_content for update to anon using (true) with check (true);

-- 2) Form submissions (requests + tutor applications)
create table if not exists submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  kind text,
  student text, name text, email text, phone text,
  grade text, school text, subject text, subjects text,
  format text, availability text, notes text, why text
);
alter table submissions enable row level security;
-- Insert only. Families' data is NOT readable with the public key (good).
create policy "anyone can submit" on submissions for insert to anon with check (true);

-- 3) Volunteer hours
create table if not exists hours (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name text, hours numeric, subject text, date text
);
alter table hours enable row level security;
create policy "anyone can log hours" on hours for insert to anon with check (true);
create policy "anyone can read hours" on hours for select to anon using (true);
```

2. In Supabase: **Project settings → API**. Copy the **Project URL** and the **anon public** key.
3. Open `js/config.js` and paste them in:

```js
window.HLA_SUPABASE = {
  url: "https://YOURPROJECT.supabase.co",
  anonKey: "your-anon-public-key"
};
```

4. Commit. Done. Forms now write to `submissions`, hours to `hours`, and admin edits to `site_content`.

**Where to read submissions:** in the Supabase dashboard, **Table editor → submissions**. They are intentionally not readable from the website (that's what protects families' contact details). The admin page's Submissions tab will point you here.

---

## Editing the site (admin)

Go to `your-site.vercel.app/admin.html`, enter your key, and edit:

- **Content** — org name, mission, founders line, announcement bar
- **Quick facts** — the four editable facts
- **Contact & social** — email, location, and social links (an icon appears in the footer only when you add a link; no need to type `https://`)
- **Submissions** — leads (in the Supabase dashboard once connected)
- **Hours log** — every session members have logged

Without Supabase, edits save to the browser you're using. With Supabase, they go live for everyone.

---

## Security notes

- **The admin key is client-side.** It stops casual visitors, not a determined person who reads the page source. Because admin edits are served to everyone once Supabase is connected, treat the key like a password and change it from the default. For stronger protection later, move admin behind Supabase Auth.
- **Families' data is insert-only.** The SQL above lets the site *write* tutoring requests but not *read* them with the public key, so a child's name and a parent's email can't be pulled by anyone who views the page source. You read submissions in the Supabase dashboard, which is protected by your Supabase login.
- **Hours are readable** with the public key (first name, hours, subject) so the portal can show a tutor their total. That's lower-sensitivity than contact info, but know that it's the trade-off.
- **No payment data, ever.** The site never collects payment info. It's free.

---

## Run locally (optional)

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. (Forms/hours use the browser's local storage until Supabase is connected.)
