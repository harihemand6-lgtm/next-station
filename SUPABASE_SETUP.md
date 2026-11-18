# Turning on live players and chat (free)

**Status: done (17 Nov 2026; leaderboard updated for 20 lives and 5 cities on 18 Nov 2026).** Project `next-station` (Mumbai, free plan) is live, both tables below exist with
explicit grants, and `js/config.js` holds the Project URL and the publishable key. The steps below are kept
for reference, e.g. if you ever rebuild the project.

1. Create a free project at supabase.com (region: Mumbai).
2. Project Settings → API: copy the **Project URL** and the **anon / publishable key** into `js/config.js`.
   Never put the `service_role` / secret key in this repo.
3. SQL Editor → run this once, so player reports can be saved (nothing else is stored):

```sql
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  room text,
  reported_nick text,
  reason text,
  messages jsonb
);
alter table public.reports enable row level security;
-- players can file a report, but nobody can read reports through the public key
create policy "players can file reports" on public.reports
  for insert to anon with check (char_length(coalesce(reason, '')) <= 200);
revoke all on public.reports from anon, authenticated;
grant insert on public.reports to anon;
```

4. Check reports in Table Editor → `reports` at least once a day. As grievance officer you must
   acknowledge complaints within 24 hours and resolve them within 15 days. Delete a report row once closed.

Free plan limits: 200 concurrent realtime connections, 2 million realtime messages a month, and the
project pauses after 7 days without activity (the game falls back to solo mode; click Restore in the
Supabase dashboard).

## Leaderboard (run once, also in SQL Editor)

```sql
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  nick text not null check (char_length(nick) <= 40),
  life text not null check (life ~ '^[a-z]{2,10}$'),
  state text not null check (state in ('KL','MH','KA','TG','DL')),
  ending text check (char_length(ending) <= 30),
  score integer not null check (score between 0 and 20000),
  daily date
);
alter table public.scores enable row level security;
create policy "anyone can add a score" on public.scores for insert to anon with check (true);
create policy "anyone can read scores" on public.scores for select to anon using (true);
revoke all on public.scores from anon, authenticated;
grant insert, select on public.scores to anon;
create index if not exists scores_daily on public.scores (daily, score desc);
create index if not exists scores_life on public.scores (life, score desc);
```

Scores are sent by players' browsers, so a determined cheater can fake one. Delete suspicious rows in
Table Editor → `scores`.

## FXN Nagar houses (run once, also in SQL Editor)

Makes township houses shared: every player sees who lives where. Without this table the township
still works, but each player only sees their own house. Browsers can read the table; they can only
change it through the two functions below, which check a secret key kept on the owner's device.

```sql
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.plots (
  city text not null check (city ~ '^[A-Z]{2}$'),
  plot text not null check (plot ~ '^[TV][0-9]{2}$'),
  st jsonb not null default '{}'::jsonb,
  owner_hash text,
  updated_at timestamptz not null default now(),
  primary key (city, plot)
);
alter table public.plots enable row level security;
drop policy if exists "anyone can read plots" on public.plots;
create policy "anyone can read plots" on public.plots for select to anon, authenticated using (true);
revoke all on public.plots from anon, authenticated;
grant select on public.plots to anon, authenticated;

-- claim or update a plot: free, on resale, abandoned for 21 days, or already yours
create or replace function public.claim_plot(p_city text, p_plot text, p_key text, p_st jsonb)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare h text; r public.plots;
begin
  if p_city !~ '^[A-Z]{2}$' or p_plot !~ '^[TV][0-9]{2}$' or length(coalesce(p_key, '')) not between 20 and 80
     or pg_column_size(p_st) > 1500 or coalesce(p_st->>'s', '') not in ('own', 'rent')
     or coalesce(p_st->>'st', '') not in ('kerala', 'modern', 'villa') then return false; end if;
  h := encode(extensions.digest(p_key, 'sha256'), 'hex');
  select * into r from public.plots where city = p_city and plot = p_plot for update;
  if found and r.owner_hash is not null and r.owner_hash <> h and coalesce(r.st->>'s', '') <> 'resale'
     and r.updated_at > now() - interval '21 days' then return false; end if;
  insert into public.plots (city, plot, st, owner_hash, updated_at) values (p_city, p_plot, p_st, h, now())
  on conflict (city, plot) do update set st = excluded.st, owner_hash = excluded.owner_hash, updated_at = now();
  return true;
end $$;

-- give a plot up: owners' houses go on resale with the broker, rented houses go back to FXN Rentals
create or replace function public.release_plot(p_city text, p_plot text, p_key text, p_resale boolean)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare h text := encode(extensions.digest(coalesce(p_key, ''), 'sha256'), 'hex');
begin
  if p_resale then
    update public.plots set st = jsonb_set(st - 'nk', '{s}', '"resale"'), owner_hash = null, updated_at = now()
    where city = p_city and plot = p_plot and owner_hash = h;
  else
    delete from public.plots where city = p_city and plot = p_plot and owner_hash = h;
  end if;
  return found;
end $$;

revoke all on function public.claim_plot(text, text, text, jsonb) from public;
revoke all on function public.release_plot(text, text, text, boolean) from public;
grant execute on function public.claim_plot(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.release_plot(text, text, text, boolean) to anon, authenticated;
```

To reset the township, delete rows in Table Editor → `plots`.
