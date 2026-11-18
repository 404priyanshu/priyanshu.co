-- L8: let the site run on the publishable (anon) key instead of the
-- service-role key. The site needs exactly three things from the database:
--   1. read view counts            (/api/views)
--   2. increment a view count      (src/proxy.js -> increment_view_count)
--   3. insert a bookmark submission (/api/submit-bookmark)
-- After this migration, the anon role can do those three things and nothing
-- else. A leaked key then lets someone read public view counts, add views and
-- add submissions. It can no longer read submitter emails or change any data.
--
-- State before this migration (checked on 2026-10-12):
--   * RLS is on for both tables, with no policies, so anon sees no rows.
--   * anon and authenticated have Supabase's default ALL grant on views.
--   * increment_view_count is SECURITY DEFINER and only service_role can
--     execute it.
--
-- Safe to apply before the code change: the service-role key bypasses RLS and
-- keeps working, so the site does not break between the two steps.

begin;

-- 1. views: read only, through a policy.
revoke all on table public.views from anon, authenticated;
grant select on table public.views to anon;

create policy "Anyone can read view counts"
  on public.views
  for select
  to anon
  using (true);

-- 2. increment_view_count: anon may call it. The function is SECURITY DEFINER,
-- so it writes as its owner and anon needs no write access to views.
-- The slug check stops arbitrary strings from creating rows. The proxy already
-- sends only real post slugs, so this is a second line of defence.
create or replace function public.increment_view_count(page_slug text)
  returns integer
  language sql
  security definer
  set search_path = public
as $$
  insert into public.views as v (slug, count)
  select page_slug, 1
  where page_slug ~ '^[a-z0-9][a-z0-9-]{0,120}$'
  on conflict (slug) do update set count = v.count + 1
  returning v.count;
$$;

revoke execute on function public.increment_view_count(text) from public;
grant execute on function public.increment_view_count(text) to anon;

-- 3. bookmark_submissions: insert only. No select, so submitted emails stay
-- unreadable with this key. The column list keeps id and created_at on their
-- defaults. The existing CHECK constraints still cap url, email and type.
grant insert (url, email, type, moderation) on table public.bookmark_submissions to anon;

create policy "Anyone can submit a bookmark"
  on public.bookmark_submissions
  for insert
  to anon
  with check (true);

commit;

-- Optional cleanup, NOT run by this migration: rows created by slugs that are
-- not current posts. Check mini-itx-teenage-engineering-computer-1 first; it
-- may be a post you removed on purpose.
--
-- delete from public.views
-- where slug in ('definitely-not-a-real-post', 'null', 'my-first-post', 'mini-itx-teenage-engineering-computer-1');
