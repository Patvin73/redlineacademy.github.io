-- ==========================================================
-- Redline Academy - Supabase Health Check
-- Safe to run multiple times (read-only checks).
-- ==========================================================

-- 1) Quick PASS/FAIL summary
with checks as (
  select
    'profiles table exists' as check_name,
    case when to_regclass('public.profiles') is not null then 'PASS' else 'FAIL' end as status,
    coalesce(to_regclass('public.profiles')::text, 'missing') as details
  union all
  select
    'marketer_schools table exists',
    case when to_regclass('public.marketer_schools') is not null then 'PASS' else 'FAIL' end,
    coalesce(to_regclass('public.marketer_schools')::text, 'missing')
  union all
  select
    'marketer_claims table exists',
    case when to_regclass('public.marketer_claims') is not null then 'PASS' else 'FAIL' end,
    coalesce(to_regclass('public.marketer_claims')::text, 'missing')
  union all
  select
    'profiles.updated_at exists',
    case when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'updated_at'
    ) then 'PASS' else 'FAIL' end,
    'required by trigger/function update statements'
  union all
  select
    'profiles.marketer_id exists',
    case when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'marketer_id'
    ) then 'PASS' else 'FAIL' end,
    'required for marketer code mapping and staging staff aliasing'
  union all
  select
    'profiles_role_check allows marketer plus staging staff alias',
    case when exists (
      select 1
      from pg_constraint c
      where c.conrelid = 'public.profiles'::regclass
        and c.contype = 'c'
        and c.conname = 'profiles_role_check'
        and pg_get_constraintdef(c.oid) ilike '%marketer%'
        and pg_get_constraintdef(c.oid) ilike '%staff%'
    ) then 'PASS' else 'FAIL' end,
    'role check must include student/admin/trainer/marketer/staging staff alias'
  union all
  select
    'sequence student_code_seq exists',
    case when to_regclass('public.student_code_seq') is not null then 'PASS' else 'FAIL' end,
    coalesce(to_regclass('public.student_code_seq')::text, 'missing')
  union all
  select
    'sequence trainer_code_seq exists',
    case when to_regclass('public.trainer_code_seq') is not null then 'PASS' else 'FAIL' end,
    coalesce(to_regclass('public.trainer_code_seq')::text, 'missing')
  union all
  select
    'sequence admin_code_seq exists',
    case when to_regclass('public.admin_code_seq') is not null then 'PASS' else 'FAIL' end,
    coalesce(to_regclass('public.admin_code_seq')::text, 'missing')
  union all
  select
    'trigger on_auth_user_created exists',
    case when exists (
      select 1
      from pg_trigger t
      where t.tgrelid = 'auth.users'::regclass
        and not t.tgisinternal
        and t.tgname = 'on_auth_user_created'
        and t.tgenabled in ('O', 'A')
    ) then 'PASS' else 'FAIL' end,
    'auth.users -> public.handle_new_user'
  union all
  select
    'trigger trg_profiles_assign_role_ids exists',
    case when exists (
      select 1
      from pg_trigger t
      where t.tgrelid = 'public.profiles'::regclass
        and not t.tgisinternal
        and t.tgname = 'trg_profiles_assign_role_ids'
        and t.tgenabled in ('O', 'A')
    ) then 'PASS' else 'FAIL' end,
    'profiles role-id assignment trigger'
  union all
  select
    'function handle_new_user is security definer',
    case when exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'handle_new_user'
        and p.prosecdef = true
    ) then 'PASS' else 'FAIL' end,
    'required for auth trigger context'
  union all
  select
    'function assign_user_role supports marketer plus staging staff alias',
    case when exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'assign_user_role'
        and pg_get_functiondef(p.oid) ilike '%marketer%'
        and pg_get_functiondef(p.oid) ilike '%staff%'
    ) then 'PASS' else 'FAIL' end,
    'template role assignment function'
  union all
  select
    'RLS enabled on profiles',
    case when exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'profiles' and c.relrowsecurity = true
    ) then 'PASS' else 'FAIL' end,
    'row-level security should be enabled'
  union all
  select
    'RLS enabled on marketer_schools',
    case when exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'marketer_schools' and c.relrowsecurity = true
    ) then 'PASS' else 'FAIL' end,
    'row-level security should be enabled'
  union all
  select
    'RLS enabled on marketer_claims',
    case when exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'marketer_claims' and c.relrowsecurity = true
    ) then 'PASS' else 'FAIL' end,
    'row-level security should be enabled'
)
select
  check_name,
  status,
  details
from checks
order by
  case when status = 'FAIL' then 0 else 1 end,
  check_name;

-- 2) Detailed: non-null columns in profiles without defaults (potential insert blockers)
select
  column_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and is_nullable = 'NO'
  and column_default is null
  and column_name <> 'id'
order by column_name;

-- 3) Detailed: role constraints on profiles
select
  conname,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.profiles'::regclass
  and contype = 'c'
order by conname;

-- 4) Detailed: active triggers on auth.users + public.profiles
select
  'auth.users' as table_name,
  t.tgname,
  t.tgenabled,
  n.nspname as function_schema,
  p.proname as function_name
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
join pg_namespace n on n.oid = p.pronamespace
where t.tgrelid = 'auth.users'::regclass
  and not t.tgisinternal
union all
select
  'public.profiles' as table_name,
  t.tgname,
  t.tgenabled,
  n.nspname as function_schema,
  p.proname as function_name
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
join pg_namespace n on n.oid = p.pronamespace
where t.tgrelid = 'public.profiles'::regclass
  and not t.tgisinternal
order by 1, 2;

-- 5) Detailed: core function owner + security definer flags
select
  n.nspname as schema_name,
  p.proname,
  pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('next_role_id', 'assign_profile_role_ids', 'handle_new_user', 'assign_user_role')
order by p.proname;

-- 6) Detailed: policy inventory for marketer tables + profiles
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'marketer_schools', 'marketer_claims')
order by tablename, policyname;
