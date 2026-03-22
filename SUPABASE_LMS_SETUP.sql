-- Supabase setup for Redline Academy LMS (student/admin/trainer)
-- Staff is a staging-only alias that shares the marketer portal path.
-- Safe to re-run in Supabase SQL Editor.

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ==========================================================
-- PROFILES (core auth-linked table)
-- ==========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student',
  student_id text,
  admin_id text,
  email text,
  phone text,
  date_of_birth date,
  timezone text default 'Australia/Sydney',
  address text,
  city text,
  postcode text,
  bio text,
  avatar_url text,
  id_document_path text,
  batch text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists timezone text default 'Australia/Sydney';
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists postcode text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists id_document_path text;
alter table public.profiles add column if not exists batch text;
alter table public.profiles add column if not exists student_id text;
alter table public.profiles add column if not exists admin_id text;
alter table public.profiles add column if not exists is_active boolean not null default true;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('student', 'admin', 'trainer'));
  end if;
end
$$;

create unique index if not exists profiles_student_id_unique on public.profiles(student_id) where student_id is not null;
create unique index if not exists profiles_admin_id_unique on public.profiles(admin_id) where admin_id is not null;
create index if not exists idx_profiles_role on public.profiles(role);

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

-- ==========================================================
-- LOOKUP + LMS TABLES REFERENCED BY JS
-- ==========================================================
create table if not exists public.categories (
  id text primary key,
  name text not null
);

insert into public.categories (id, name) values
  ('aged-care', 'Aged Care'),
  ('disability-support', 'Disability Support'),
  ('first-aid', 'First Aid'),
  ('mental-health', 'Mental Health'),
  ('medication', 'Medication Assistance'),
  ('manual-handling', 'Manual Handling'),
  ('infection-control', 'Infection Control')
on conflict (id) do update set name = excluded.name;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  category_id text references public.categories(id) on delete set null,
  level text not null default 'beginner',
  duration_hours numeric(8,2),
  pass_mark integer not null default 70 check (pass_mark between 0 and 100),
  enrollment_type text not null default 'open' check (enrollment_type in ('open','invite_only','paid')),
  max_students integer,
  price numeric(12,2) not null default 0,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_trainer on public.courses(trainer_id);

-- ==========================================================
-- LESSONS (core table required by base schema)
-- ==========================================================
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
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','cancelled','suspended')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);

-- ==========================================================
-- PROGRESS (lesson-level)
-- ==========================================================
create table if not exists public.progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles(id),
  lesson_id uuid references public.lessons(id),
  completed boolean default false,
  completed_at timestamptz
);

create index if not exists idx_progress_student on public.progress(student_id);

create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  completion_percent numeric(5,2) not null default 0 check (completion_percent between 0 and 100),
  lessons_completed integer not null default 0,
  last_accessed_at timestamptz,
  last_lesson_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  pass_mark integer not null default 70 check (pass_mark between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','under_review','graded','resubmit_required')),
  submitted_at timestamptz not null default now(),
  grade numeric(5,2),
  feedback text,
  notes text,
  file_urls text[] not null default '{}'::text[],
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(assignment_id, student_id)
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  event_type text not null default 'live_session',
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  meeting_url text,
  is_mandatory boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  subject text,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  body text not null,
  target_role text not null default 'all' check (target_role in ('all','student','trainer','admin')),
  is_published boolean not null default true,
  publish_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  currency text not null default 'IDR',
  payment_gateway text,
  payment_method text,
  status text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  payment_plan text not null default 'full' check (payment_plan in ('full','installment')),
  installment_total integer not null default 1,
  installment_paid integer not null default 0,
  next_due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments add column if not exists payment_gateway text;
alter table public.payments alter column currency set default 'IDR';

create unique index if not exists payments_student_course_unique on public.payments(student_id, course_id);
create index if not exists idx_payments_student on public.payments(student_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_installment_check'
  ) then
    alter table public.payments
      add constraint payments_installment_check
      check (
        installment_total between 1 and 4
        and installment_paid between 0 and installment_total
      );
  end if;
end
$$;

-- ==========================================================
-- MARKETERS + REFERRALS (base schema)
-- ==========================================================
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

-- ==========================================================
-- AUDIT LOG (base schema)
-- ==========================================================
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  action text,
  target_table text,
  target_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_audit_logs_user on public.audit_logs(user_id);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  issued_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ==========================================================
-- HELPERS + TRIGGERS
-- ==========================================================
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin' and is_active = true
  );
exception
  when undefined_column then
    return exists (
      select 1 from public.profiles
      where id = user_id and role = 'admin'
    );
  when undefined_table then
    return false;
end;
$$;

create or replace function public.is_staff(user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role in ('trainer','admin') and is_active = true
  );
exception
  when undefined_column then
    return exists (
      select 1 from public.profiles
      where id = user_id and role in ('trainer','admin')
    );
  when undefined_table then
    return false;
end;
$$;

create sequence if not exists public.student_code_seq as bigint start with 1 increment by 1;
create sequence if not exists public.trainer_code_seq as bigint start with 1 increment by 1;
create sequence if not exists public.admin_code_seq as bigint start with 1 increment by 1;

do $$
begin
  perform setval(
    'public.student_code_seq',
    coalesce((select max((regexp_match(student_id, '^STD-([0-9]+)$'))[1]::bigint) from public.profiles where student_id ~ '^STD-[0-9]+$'), 0) + 1,
    false
  );

  perform setval(
    'public.trainer_code_seq',
    coalesce((select max((regexp_match(admin_id, '^TRN-([0-9]+)$'))[1]::bigint) from public.profiles where admin_id ~ '^TRN-[0-9]+$'), 0) + 1,
    false
  );

  perform setval(
    'public.admin_code_seq',
    coalesce((select max((regexp_match(admin_id, '^ADM-([0-9]+)$'))[1]::bigint) from public.profiles where admin_id ~ '^ADM-[0-9]+$'), 0) + 1,
    false
  );
end
$$;

create or replace function public.next_role_id(role_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := lower(coalesce(role_name, ''));
begin
  if v_role = 'student' then
    return 'STD-' || lpad(nextval('public.student_code_seq')::text, 5, '0');
  elsif v_role = 'trainer' then
    return 'TRN-' || lpad(nextval('public.trainer_code_seq')::text, 5, '0');
  elsif v_role = 'admin' then
    return 'ADM-' || lpad(nextval('public.admin_code_seq')::text, 5, '0');
  end if;
  return null;
end;
$$;

create or replace function public.assign_profile_role_ids()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'student' then
    if coalesce(new.student_id, '') = '' then
      new.student_id := public.next_role_id('student');
    end if;
    new.admin_id := null;
  elsif new.role = 'trainer' then
    if coalesce(new.admin_id, '') = '' or new.admin_id !~ '^TRN-[0-9]+$' then
      new.admin_id := public.next_role_id('trainer');
    end if;
    new.student_id := null;
  elsif new.role = 'admin' then
    if coalesce(new.admin_id, '') = '' or new.admin_id !~ '^ADM-[0-9]+$' then
      new.admin_id := public.next_role_id('admin');
    end if;
    new.student_id := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_assign_role_ids on public.profiles;
create trigger trg_profiles_assign_role_ids
  before insert or update of role on public.profiles
  for each row execute procedure public.assign_profile_role_ids();

-- Backfill existing users that still don't have role IDs.
update public.profiles
set student_id = public.next_role_id('student')
where role = 'student'
  and coalesce(student_id, '') = '';

update public.profiles
set admin_id = public.next_role_id('trainer')
where role = 'trainer'
  and (coalesce(admin_id, '') = '' or admin_id !~ '^TRN-[0-9]+$');

update public.profiles
set admin_id = public.next_role_id('admin')
where role = 'admin'
  and (coalesce(admin_id, '') = '' or admin_id !~ '^ADM-[0-9]+$');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, email, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(nullif(lower(new.raw_user_meta_data ->> 'role'), ''), 'student'),
    new.email,
    true
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated.';
  end if;

  if public.is_admin(v_uid) then
    return new;
  end if;

  if v_uid <> old.id then
    raise exception 'Not allowed to update this profile.';
  end if;

  if new.role is distinct from old.role
    or new.student_id is distinct from old.student_id
    or new.admin_id is distinct from old.admin_id
    or new.is_active is distinct from old.is_active
    or new.email is distinct from old.email then
    raise exception 'Restricted profile fields cannot be changed by this user.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_guard_update on public.profiles;
create trigger trg_profiles_guard_update
  before update on public.profiles
  for each row execute procedure public.guard_profile_update();

revoke all on function public.is_admin(uuid) from public;
revoke all on function public.is_staff(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;

-- ==========================================================
-- VIEWS USED BY DASHBOARD JS
-- ==========================================================
create or replace view public.v_student_dashboard with (security_invoker = true) as
select
  p.id as student_id,
  count(distinct e.course_id) filter (where e.status in ('active','completed'))::int as courses_enrolled,
  coalesce(sum(cp.lessons_completed), 0)::int as lessons_completed,
  count(distinct s.id) filter (where s.status in ('submitted','under_review','resubmit_required'))::int as pending_submissions,
  count(distinct cert.id)::int as certificates_earned
from public.profiles p
left join public.enrollments e on e.student_id = p.id
left join public.course_progress cp on cp.student_id = p.id and cp.course_id = e.course_id
left join public.assignment_submissions s on s.student_id = p.id
left join public.certificates cert on cert.student_id = p.id
where p.role = 'student'
group by p.id;

create or replace view public.v_trainer_dashboard with (security_invoker = true) as
select
  p.id as trainer_id,
  (select count(distinct e.student_id)::int from public.courses c join public.enrollments e on e.course_id = c.id where c.trainer_id = p.id) as total_students,
  (select count(*)::int from public.courses c where c.trainer_id = p.id) as courses_created,
  (select count(*)::int from public.assignments a join public.assignment_submissions s on s.assignment_id = a.id where a.trainer_id = p.id and s.status = 'submitted') as pending_grading,
  (select round(coalesce(avg(cp.completion_percent),0)::numeric,1) from public.courses c join public.course_progress cp on cp.course_id = c.id where c.trainer_id = p.id) as avg_completion_percent
from public.profiles p
where p.role in ('trainer','admin');

create or replace view public.v_students_at_risk with (security_invoker = true) as
select
  e.student_id,
  p.full_name,
  p.email,
  c.title as course_title,
  coalesce(cp.completion_percent,0) as completion_percent,
  cp.last_accessed_at,
  coalesce(floor(extract(epoch from (now() - cp.last_accessed_at)) / 86400)::int, 9999) as inactive_duration
from public.enrollments e
join public.profiles p on p.id = e.student_id
join public.courses c on c.id = e.course_id
left join lateral (
  select cp2.completion_percent, cp2.last_accessed_at
  from public.course_progress cp2
  where cp2.enrollment_id = e.id
  order by cp2.last_accessed_at desc nulls last
  limit 1
) cp on true
where e.status = 'active'
  and (cp.last_accessed_at is null or cp.last_accessed_at < now() - interval '7 days');

create or replace view public.v_course_overview with (security_invoker = true) as
select
  c.id as course_id,
  c.title,
  t.full_name as trainer_name,
  count(distinct e.student_id)::int as total_enrolled,
  count(distinct e.student_id) filter (where e.status = 'completed')::int as total_completed,
  round(coalesce(avg(cp.completion_percent),0)::numeric,1) as completion_rate_pct,
  count(distinct cert.id)::int as certificates_issued
from public.courses c
left join public.profiles t on t.id = c.trainer_id
left join public.enrollments e on e.course_id = c.id
left join public.course_progress cp on cp.course_id = c.id and cp.student_id = e.student_id
left join public.certificates cert on cert.course_id = c.id
group by c.id, c.title, t.full_name;

-- ==========================================================
-- RLS POLICIES
-- ==========================================================
-- Uses helper functions defined in HELPERS + TRIGGERS above.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.course_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.schedules enable row level security;
alter table public.forum_posts enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.announcements enable row level security;
alter table public.payments enable row level security;
alter table public.marketers enable row level security;
alter table public.referrals enable row level security;
alter table public.certificates enable row level security;
alter table public.audit_logs enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles_select_self_or_staff" on public.profiles;
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_staff" on public.profiles for select to authenticated using (auth.uid() = id or public.is_staff(auth.uid()));
create policy "profiles_update_self_or_admin" on public.profiles for update to authenticated using (auth.uid() = id or public.is_admin(auth.uid())) with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories for select to authenticated using (true);

drop policy if exists "lms_select_all_courses" on public.courses;
drop policy if exists "lms_write_staff_courses" on public.courses;
create policy "lms_select_all_courses" on public.courses for select to authenticated using (true);
create policy "lms_write_staff_courses" on public.courses for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_enrollments" on public.enrollments;
drop policy if exists "lms_write_staff_enrollments" on public.enrollments;
create policy "lms_select_all_enrollments" on public.enrollments for select to authenticated using (true);
create policy "lms_write_staff_enrollments" on public.enrollments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_course_progress" on public.course_progress;
drop policy if exists "lms_write_staff_course_progress" on public.course_progress;
create policy "lms_select_all_course_progress" on public.course_progress for select to authenticated using (true);
create policy "lms_write_staff_course_progress" on public.course_progress for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_assignments" on public.assignments;
drop policy if exists "lms_write_staff_assignments" on public.assignments;
create policy "lms_select_all_assignments" on public.assignments for select to authenticated using (true);
create policy "lms_write_staff_assignments" on public.assignments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_submissions" on public.assignment_submissions;
drop policy if exists "lms_write_staff_submissions" on public.assignment_submissions;
drop policy if exists "lms_student_insert_own_submission" on public.assignment_submissions;
create policy "lms_select_all_submissions" on public.assignment_submissions for select to authenticated using (true);
create policy "lms_write_staff_submissions" on public.assignment_submissions for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "lms_student_insert_own_submission" on public.assignment_submissions for insert to authenticated with check (student_id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_schedules" on public.schedules;
drop policy if exists "lms_write_staff_schedules" on public.schedules;
create policy "lms_select_all_schedules" on public.schedules for select to authenticated using (true);
create policy "lms_write_staff_schedules" on public.schedules for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_forum_posts" on public.forum_posts;
drop policy if exists "lms_write_staff_forum_posts" on public.forum_posts;
drop policy if exists "lms_insert_own_forum_posts" on public.forum_posts;
create policy "lms_select_all_forum_posts" on public.forum_posts for select to authenticated using (true);
create policy "lms_write_staff_forum_posts" on public.forum_posts for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "lms_insert_own_forum_posts" on public.forum_posts for insert to authenticated with check (author_id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists "messages_select_participants_or_staff" on public.messages;
drop policy if exists "messages_insert_sender_or_staff" on public.messages;
drop policy if exists "messages_update_participants_or_staff" on public.messages;
create policy "messages_select_participants_or_staff" on public.messages for select to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_staff(auth.uid()));
create policy "messages_insert_sender_or_staff" on public.messages for insert to authenticated with check (sender_id = auth.uid() or public.is_staff(auth.uid()));
create policy "messages_update_participants_or_staff" on public.messages for update to authenticated using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_staff(auth.uid())) with check (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists "notifications_select_owner_or_staff" on public.notifications;
drop policy if exists "notifications_insert_owner_or_staff" on public.notifications;
drop policy if exists "notifications_update_owner_or_staff" on public.notifications;
create policy "notifications_select_owner_or_staff" on public.notifications for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "notifications_insert_owner_or_staff" on public.notifications for insert to authenticated with check (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "notifications_update_owner_or_staff" on public.notifications for update to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid())) with check (user_id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_announcements" on public.announcements;
drop policy if exists "lms_write_staff_announcements" on public.announcements;
create policy "lms_select_all_announcements" on public.announcements for select to authenticated using (true);
create policy "lms_write_staff_announcements" on public.announcements for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_payments" on public.payments;
drop policy if exists "lms_write_staff_payments" on public.payments;
create policy "lms_select_all_payments" on public.payments for select to authenticated using (true);
create policy "lms_write_staff_payments" on public.payments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_certificates" on public.certificates;
drop policy if exists "lms_write_staff_certificates" on public.certificates;
create policy "lms_select_all_certificates" on public.certificates for select to authenticated using (true);
create policy "lms_write_staff_certificates" on public.certificates for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_activity_logs" on public.activity_logs;
drop policy if exists "lms_insert_own_or_staff_activity_logs" on public.activity_logs;
create policy "lms_select_all_activity_logs" on public.activity_logs for select to authenticated using (true);
create policy "lms_insert_own_or_staff_activity_logs" on public.activity_logs for insert to authenticated with check (user_id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists "lms_select_all_lessons" on public.lessons;
drop policy if exists "lms_write_staff_lessons" on public.lessons;
create policy "lms_select_all_lessons" on public.lessons for select to authenticated using (true);
create policy "lms_write_staff_lessons" on public.lessons for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

drop policy if exists "lms_select_own_progress" on public.progress;
drop policy if exists "lms_write_own_progress" on public.progress;
create policy "lms_select_own_progress" on public.progress for select to authenticated using (student_id = auth.uid() or public.is_staff(auth.uid()));
create policy "lms_write_own_progress" on public.progress for all to authenticated using (student_id = auth.uid() or public.is_staff(auth.uid())) with check (student_id = auth.uid() or public.is_staff(auth.uid()));

drop policy if exists "lms_select_own_marketers" on public.marketers;
drop policy if exists "lms_write_staff_marketers" on public.marketers;
create policy "lms_select_own_marketers" on public.marketers for select to authenticated using (user_id = auth.uid() or public.is_admin(auth.uid()) or public.is_staff(auth.uid()));
create policy "lms_write_staff_marketers" on public.marketers for all to authenticated using (public.is_admin(auth.uid()) or public.is_staff(auth.uid())) with check (public.is_admin(auth.uid()) or public.is_staff(auth.uid()));

drop policy if exists "lms_select_own_referrals" on public.referrals;
drop policy if exists "lms_write_staff_referrals" on public.referrals;
create policy "lms_select_own_referrals" on public.referrals for select to authenticated using (
  public.is_admin(auth.uid())
  or public.is_staff(auth.uid())
  or exists (
    select 1
    from public.marketers m
    where m.id = marketer_id
      and m.user_id = auth.uid()
  )
);
create policy "lms_write_staff_referrals" on public.referrals for all to authenticated using (public.is_admin(auth.uid()) or public.is_staff(auth.uid())) with check (public.is_admin(auth.uid()) or public.is_staff(auth.uid()));

drop policy if exists "lms_select_staff_audit_logs" on public.audit_logs;
drop policy if exists "lms_write_staff_audit_logs" on public.audit_logs;
create policy "lms_select_staff_audit_logs" on public.audit_logs for select to authenticated using (public.is_admin(auth.uid()) or public.is_staff(auth.uid()));
create policy "lms_write_staff_audit_logs" on public.audit_logs for insert to authenticated with check (public.is_admin(auth.uid()) or public.is_staff(auth.uid()));

-- ==========================================================
-- GRANTS
-- ==========================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.lessons to authenticated;
grant select, insert, update, delete on public.enrollments to authenticated;
grant select, insert, update, delete on public.progress to authenticated;
grant select, insert, update, delete on public.course_progress to authenticated;
grant select, insert, update, delete on public.assignments to authenticated;
grant select, insert, update, delete on public.assignment_submissions to authenticated;
grant select, insert, update, delete on public.schedules to authenticated;
grant select, insert, update, delete on public.forum_posts to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.marketers to authenticated;
grant select, insert, update, delete on public.referrals to authenticated;
grant select, insert, update, delete on public.certificates to authenticated;
grant select, insert, update, delete on public.audit_logs to authenticated;
grant select, insert, update, delete on public.activity_logs to authenticated;

grant select on public.v_student_dashboard to authenticated;
grant select on public.v_trainer_dashboard to authenticated;
grant select on public.v_students_at_risk to authenticated;
grant select on public.v_course_overview to authenticated;

-- ==========================================================
-- STORAGE BUCKET FOR AVATARS
-- ==========================================================
-- Uses helper function public.is_staff(...) defined in HELPERS + TRIGGERS.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_insert_own_or_staff" on storage.objects;
drop policy if exists "avatars_update_own_or_staff" on storage.objects;
drop policy if exists "avatars_delete_own_or_staff" on storage.objects;

create policy "avatars_public_read" on storage.objects for select to public using (bucket_id = 'avatars');
create policy "avatars_insert_own_or_staff" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (name like ('avatars/' || auth.uid()::text || '.%') or public.is_staff(auth.uid())));
create policy "avatars_update_own_or_staff" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (name like ('avatars/' || auth.uid()::text || '.%') or public.is_staff(auth.uid()))) with check (bucket_id = 'avatars' and (name like ('avatars/' || auth.uid()::text || '.%') or public.is_staff(auth.uid())));
create policy "avatars_delete_own_or_staff" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (name like ('avatars/' || auth.uid()::text || '.%') or public.is_staff(auth.uid())));

-- Bootstrap example:
-- update public.profiles set role = 'admin', admin_id = 'ADM-001'
-- where id = '00000000-0000-0000-0000-000000000000';
