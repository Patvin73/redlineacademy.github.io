-- ==========================================================
-- Redline LMS - User Role Assignment Templates
-- Staff is staging-only and maps to the marketer portal in live QA.
-- Use this in Supabase SQL Editor after auth user exists.
-- ==========================================================

-- ----------------------------------------------------------
-- STEP 0 (manual): create auth user first in Supabase UI
-- Authentication > Users > Add user
-- Example password for initial setup: 12345678
-- ----------------------------------------------------------

-- ----------------------------------------------------------
-- STEP 1: reusable function (run once, safe to re-run)
-- ----------------------------------------------------------
create or replace function public.assign_user_role(
  p_email text,
  p_role text,
  p_full_name text default null,
  p_student_id text default null,
  p_admin_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_email text;
  v_role text;
begin
  v_role := lower(trim(coalesce(p_role, '')));

  if v_role not in ('student', 'trainer', 'admin', 'marketer', 'staff') then
    raise exception 'Invalid role: %. Allowed: student, trainer, admin, marketer, staff', p_role;
  end if;

  select id, email
  into v_user_id, v_email
  from auth.users
  where email = p_email
  limit 1;

  if v_user_id is null then
    raise exception 'Auth user not found for email: %', p_email;
  end if;

  insert into public.profiles (
    id, full_name, role, student_id, admin_id, email
  )
  values (
    v_user_id,
    coalesce(p_full_name, split_part(v_email, '@', 1)),
    v_role,
    case when v_role = 'student' then p_student_id else null end,
    case when v_role in ('admin', 'trainer') then p_admin_id else null end,
    v_email
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role,
    student_id = excluded.student_id,
    admin_id = excluded.admin_id,
    email = excluded.email;
end;
$$;

-- Optional hardening: keep this function inaccessible to regular app users.
revoke all on function public.assign_user_role(text, text, text, text, text) from public;
revoke all on function public.assign_user_role(text, text, text, text, text) from authenticated;

-- ----------------------------------------------------------
-- STEP 2: use template calls for any new user
-- ----------------------------------------------------------

-- STUDENT template
-- select public.assign_user_role(
--   'student_email@domain.com',
--   'student',
--   'Student Name',
--   'STD-001',
--   null
-- );

-- TRAINER template
-- select public.assign_user_role(
--   'trainer_email@domain.com',
--   'trainer',
--   'Trainer Name',
--   null,
--   null
-- );

-- ADMIN template
-- select public.assign_user_role(
--   'admin_email@domain.com',
--   'admin',
--   'Admin Name',
--   null,
--   'ADM-001'
-- );

-- MARKETER template
-- select public.assign_user_role(
--   'marketer_email@domain.com',
--   'marketer',
--   'Marketer Name',
--   null,
--   null
-- );

-- STAFF template (staging only)
-- select public.assign_user_role(
--   'staff_email@domain.com',
--   'staff',
--   'Staff Name',
--   null,
--   null
-- );

-- ----------------------------------------------------------
-- STEP 3: verification query
-- ----------------------------------------------------------
-- select u.email, p.role, p.student_id, p.admin_id, p.full_name
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where u.email in ('student_email@domain.com', 'trainer_email@domain.com', 'admin_email@domain.com');

-- ----------------------------------------------------------
-- READY-TO-USE FOR YOUR 2 REQUESTED USERS
-- (make sure these 2 auth users already exist in Authentication > Users)
-- ----------------------------------------------------------

select public.assign_user_role(
  'student@example.com',
  'student',
  'iamstudent',
  'STD-002',
  null
);

select public.assign_user_role(
  'trainer@example.com',
  'trainer',
  'iamtrainer',
  null,
  null
);



