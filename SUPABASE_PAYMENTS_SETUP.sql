-- Supabase setup for payments/registrations
-- Safe to re-run in Supabase SQL Editor.

-- ============================================================
-- REQUIRED BASE STRUCTURE (shared with LMS)
-- ============================================================
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists created_at timestamptz default now();

do $$
declare
  v_def text;
begin
  select pg_get_constraintdef(oid)
    into v_def
  from pg_constraint
  where conname = 'profiles_role_check'
    and conrelid = 'public.profiles'::regclass;

  if v_def is null
     or v_def !~ 'student'
     or v_def !~ 'trainer'
     or v_def !~ 'admin'
     or v_def !~ 'marketer'
     or v_def !~ 'staff' then
    alter table public.profiles drop constraint if exists profiles_role_check;
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('student','trainer','admin','marketer','staff'));
  end if;
end
$$;

create index if not exists idx_profiles_role on public.profiles(role);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  trainer_id uuid references public.profiles(id),
  price numeric,
  status text default 'draft',
  created_at timestamptz default now()
);

alter table public.courses add column if not exists title text;
alter table public.courses add column if not exists description text;
alter table public.courses add column if not exists trainer_id uuid references public.profiles(id);
alter table public.courses add column if not exists price numeric;
alter table public.courses add column if not exists status text default 'draft';
alter table public.courses add column if not exists created_at timestamptz default now();

create index if not exists idx_courses_trainer on public.courses(trainer_id);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  lesson_order integer,
  created_at timestamptz default now()
);

create index if not exists idx_lessons_course on public.lessons(course_id);

create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id),
  course_id uuid references public.courses(id),
  status text default 'active',
  enrolled_at timestamptz default now()
);

create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);

create table if not exists public.progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id),
  lesson_id uuid references public.lessons(id),
  completed boolean default false,
  completed_at timestamptz
);

create index if not exists idx_progress_student on public.progress(student_id);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id),
  course_id uuid references public.courses(id),
  amount numeric,
  status text,
  payment_gateway text,
  created_at timestamptz default now()
);

create index if not exists idx_payments_student on public.payments(student_id);

create table if not exists public.marketers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  referral_code text unique,
  commission_rate numeric,
  created_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  marketer_id uuid references public.marketers(id),
  student_id uuid references public.profiles(id),
  course_id uuid references public.courses(id),
  commission numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_referrals_marketer on public.referrals(marketer_id);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  action text,
  target_table text,
  target_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_audit_logs_user on public.audit_logs(user_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.payments enable row level security;
alter table public.marketers enable row level security;
alter table public.referrals enable row level security;
alter table public.audit_logs enable row level security;

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

alter table public.registrations enable row level security;
alter table public.payment_events enable row level security;

-- auto-update updated_at on registrations
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;

drop policy if exists "payments_select_staff_registrations" on public.registrations;
create policy "payments_select_staff_registrations"
  on public.registrations for select
  to authenticated
  using (public.is_admin(auth.uid()) or public.is_staff(auth.uid()));

drop policy if exists "payments_select_staff_payment_events" on public.payment_events;
create policy "payments_select_staff_payment_events"
  on public.payment_events for select
  to authenticated
  using (public.is_admin(auth.uid()) or public.is_staff(auth.uid()));

drop trigger if exists trg_registrations_updated on public.registrations;
create trigger trg_registrations_updated
  before update on public.registrations
  for each row execute function public.update_updated_at_column();
