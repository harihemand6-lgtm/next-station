# Turning on live players and chat (free)

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
```

4. Check reports in Table Editor → `reports` at least once a day. As grievance officer you must
   acknowledge complaints within 24 hours and resolve them within 15 days. Delete a report row once closed.

Free plan limits: 200 concurrent realtime connections, 2 million realtime messages a month, and the
project pauses after 7 days without activity (the game falls back to solo mode; click Restore in the
Supabase dashboard).
