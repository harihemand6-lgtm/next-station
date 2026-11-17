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
