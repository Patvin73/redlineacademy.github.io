-- Supabase setup for payments/registrations
-- Safe to re-run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  full_name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  gender text,
  id_number text,
  address text,
  postcode text,
  qualification text,
  employment text,
  experience text,
  selected_program text not null,
  payment_plan text not null,
  payment_method text not null,
  program_fee numeric(12,2) not null,
  plan_discount numeric(12,2) not null default 0,
  promo_code text,
  promo_discount numeric(12,2) not null default 0,
  final_amount numeric(12,2) not null,
  status text not null default 'initiated'
    check (status in ('initiated','awaiting_payment','pending','paid','failed','expired','unknown')),
  transaction_id text,
  payment_url text,
  ktp_file text,
  last_error text,
  doku_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists registrations_status_idx on public.registrations(status);
create index if not exists registrations_created_at_idx on public.registrations(created_at);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  invoice_number text,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_invoice_idx on public.payment_events(invoice_number);
create index if not exists payment_events_created_at_idx on public.payment_events(created_at);

-- auto-update updated_at on registrations
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_registrations_updated on public.registrations;
create trigger trg_registrations_updated
  before update on public.registrations
  for each row execute function public.update_updated_at_column();
