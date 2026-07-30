-- ============================================================
--  Honors Learning Academy — tutor hours: schema + RLS
--  Run this ONCE in the Supabase SQL editor (Dashboard -> SQL).
--  It makes the hours logger private-per-tutor and lets an admin
--  read everything. Tutors sign in with real Supabase Auth; the
--  client never sends a name or a user id — the database does.
-- ============================================================

-- 0) The old logger wrote rows keyed by a typed name, with no owner.
--    Those cannot be attributed to a user, so clear them first (test data).
--    Skip this only if the hours table is already empty.
delete from public.hours;

-- 1) Attach every row to the signed-in user, and capture their email
--    (both filled server-side from the verified JWT, never from the client).
alter table public.hours
  add column if not exists user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  add column if not exists tutor_email text default (auth.jwt() ->> 'email');

-- 2) Lock the table: nothing is readable/writable unless a policy allows it.
alter table public.hours enable row level security;

-- 3) A tutor may INSERT only rows they own. (No JWT -> auth.uid() is null ->
--    the NOT NULL default and this check both fail, so the public anon key
--    alone cannot write. Auth is the gate.)
create policy "tutor inserts own hours"
  on public.hours for insert to authenticated
  with check (auth.uid() = user_id);

-- 4) A tutor SELECTs only their own rows; an admin selects all.
create policy "tutor reads own, admin reads all"
  on public.hours for select to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- (No UPDATE/DELETE policies on purpose: tutors can add and view hours,
--  but cannot edit or delete rows. RLS denies anything not allowed above.)

-- 5) Make your admin account an admin so the "Hours log" tab in admin.html
--    can read every tutor's rows. Use the admin's email. IMPORTANT: the admin
--    must sign OUT and back IN once after this so the new role is in their JWT.
update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where email = 'YOUR_ADMIN_EMAIL';

-- ============================================================
--  Then, in the Supabase dashboard (not SQL):
--
--  A) Turn OFF open signup so only accounts you create can exist:
--     Authentication -> Sign In / Providers -> Email
--       -> disable "Allow new users to sign up".
--
--  B) Create an account for each APPROVED tutor:
--     Authentication -> Users -> Add user
--       -> enter their email + a password
--       -> tick "Auto Confirm User"
--       -> email them the credentials + the hours URL (…/hours.html).
--
--  There is no public sign-up path; account creation is admin-only.
-- ============================================================
