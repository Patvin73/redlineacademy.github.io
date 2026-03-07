-- Supabase setup for Redline Academy LMS (student/admin/trainer)
-- Run in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('student', 'admin', 'trainer')) default 'student',
  student_id text unique,
  admin_id text unique,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'student',
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper to check admin role safely (avoid recursive RLS policy).
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- Drop policy set first (safe re-run).
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_select_admin_all" on public.profiles;

-- Anyone authenticated can read their own profile.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Admin can read all profiles (needed by admin dashboard).
create policy "profiles_select_admin_all"
  on public.profiles for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- User can update their own basic profile row.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Bootstrap example: promote one existing user to admin.
-- Replace with a real UUID from auth.users.
-- update public.profiles
-- set role = 'admin', admin_id = 'ADM-001'
-- where id = '00000000-0000-0000-0000-000000000000';

