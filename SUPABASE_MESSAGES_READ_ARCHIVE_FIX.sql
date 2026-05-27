-- Idempotent compatibility migration for dashboard message read/archive state.
alter table public.messages add column if not exists read_at timestamptz;
alter table public.messages add column if not exists is_archived boolean not null default false;
