-- Seed data for local Supabase development.
-- Runs via `supabase db reset` (see `supabase/config.toml` -> [db.seed].sql_paths).

-- Bucket used by Payload's s3Storage() config.
insert into storage.buckets (id, name, public)
values ('supabase-payload', 'supabase-payload', false)
on conflict (id) do nothing;

