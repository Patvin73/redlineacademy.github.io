-- ==========================================================
-- Redline Academy - Supabase Smoke Test (Marketer Flow)
--
-- Purpose:
-- - Validate role assignment path for marketer/staff users.
-- - Validate marketer_schools + marketer_claims inserts.
-- - Leave database unchanged by rolling back at the end.
--
-- Usage:
-- 1) Create a dummy Auth user first in Supabase Auth UI.
-- 2) Replace v_email below with that dummy user's email.
-- 3) Run this file as one script in SQL Editor.
-- ==========================================================

begin;

do $$
declare
  v_email text := 'REPLACE_WITH_TEST_EMAIL';
  v_marketer_code text := 'MKT-SMOKE-001';
  v_user_id uuid;
  v_school_id uuid;
  v_claim_id uuid;
  v_has_updated_at boolean;
begin
  if v_email = 'REPLACE_WITH_TEST_EMAIL' then
    raise exception 'Set v_email in this script before running smoke test.';
  end if;

  select id
  into v_user_id
  from auth.users
  where email = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'Auth user not found for email: %', v_email;
  end if;

  if to_regclass('public.profiles') is null then
    raise exception 'Missing table: public.profiles';
  end if;

  if to_regclass('public.marketer_schools') is null then
    raise exception 'Missing table: public.marketer_schools';
  end if;

  if to_regclass('public.marketer_claims') is null then
    raise exception 'Missing table: public.marketer_claims';
  end if;

  perform public.assign_user_role(
    v_email,
    'marketer',
    'Smoke Test User',
    null,
    null
  );

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'updated_at'
  ) into v_has_updated_at;

  if v_has_updated_at then
    execute 'update public.profiles set marketer_id = $1, updated_at = now() where id = $2'
      using v_marketer_code, v_user_id;
  else
    execute 'update public.profiles set marketer_id = $1 where id = $2'
      using v_marketer_code, v_user_id;
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = v_user_id and role = 'marketer' and marketer_id = v_marketer_code
  ) then
    raise exception 'Failed to set marketer role/code for %', v_email;
  end if;

  insert into public.marketer_schools (
    marketer_id,
    name,
    city,
    contact_name,
    phone,
    notes,
    status
  )
  values (
    v_user_id,
    'SMOKE TEST SCHOOL',
    'Jakarta',
    'Smoke PIC',
    '08000000000',
    'Created by smoke test (rolled back).',
    'active'
  )
  returning id into v_school_id;

  insert into public.marketer_claims (
    marketer_id,
    school_id,
    presentation_date,
    students_present,
    students_enrolled,
    program_fee,
    access_fee,
    enrollment_comm,
    bonus,
    notes,
    status
  )
  values (
    v_user_id,
    v_school_id,
    current_date,
    10,
    2,
    1000000,
    50000,
    100000,
    25000,
    'Created by smoke test (rolled back).',
    'pending'
  )
  returning id into v_claim_id;

  if v_school_id is null or v_claim_id is null then
    raise exception 'Smoke inserts failed (school_id or claim_id is null).';
  end if;

  raise notice 'SMOKE TEST PASS: user_id=%, school_id=%, claim_id=%', v_user_id, v_school_id, v_claim_id;
end $$;

-- Keep data clean after test.
rollback;

select 'SMOKE TEST FINISHED (ROLLBACK APPLIED)' as result;
