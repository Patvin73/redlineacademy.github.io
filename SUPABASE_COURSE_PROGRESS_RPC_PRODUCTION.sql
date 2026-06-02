-- Redline Academy LMS production course progress RPC + RLS hardening.
-- Run after SUPABASE_PROGRESS_CONSTRAINTS_RLS_FIX.sql has successfully added:
--   progress(student_id, lesson_id)
--   course_progress(student_id, course_id)

begin;

create or replace function public.recalculate_course_progress(
  p_student_id uuid,
  p_course_id uuid,
  p_last_lesson_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_enrollment_id uuid;
  v_enrollment_status text;
  v_total_lessons integer := 0;
  v_completed_lessons integer := 0;
  v_total_assignments integer := 0;
  v_passed_assignments integer := 0;
  v_total_units integer := 0;
  v_completion_percent numeric(5,2) := 0;
begin
  if v_uid is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if p_student_id is null or p_course_id is null then
    raise exception 'p_student_id and p_course_id are required'
      using errcode = '22023';
  end if;

  if not (v_uid = p_student_id or private.is_staff(v_uid)) then
    raise exception 'Not allowed to recalculate this course progress'
      using errcode = '42501';
  end if;

  select id, status
    into v_enrollment_id, v_enrollment_status
  from public.enrollments
  where student_id = p_student_id
    and course_id = p_course_id
  limit 1;

  if v_enrollment_id is null then
    raise exception 'Enrollment not found for student/course'
      using errcode = 'P0002';
  end if;

  select count(*)::integer
    into v_total_lessons
  from public.lessons
  where course_id = p_course_id;

  select count(distinct p.lesson_id)::integer
    into v_completed_lessons
  from public.progress p
  join public.lessons l on l.id = p.lesson_id
  where p.student_id = p_student_id
    and l.course_id = p_course_id
    and coalesce(p.completed, false) = true;

  select count(*)::integer
    into v_total_assignments
  from public.assignments
  where course_id = p_course_id;

  select count(distinct s.assignment_id)::integer
    into v_passed_assignments
  from public.assignment_submissions s
  join public.assignments a on a.id = s.assignment_id
  where s.student_id = p_student_id
    and a.course_id = p_course_id
    and s.status = 'graded'
    and s.grade is not null
    and s.grade >= coalesce(a.pass_mark, 70);

  v_total_units := coalesce(v_total_lessons, 0) + coalesce(v_total_assignments, 0);
  v_completion_percent := case
    when v_total_units <= 0 then 0
    else least(
      100,
      round(
        ((coalesce(v_completed_lessons, 0) + coalesce(v_passed_assignments, 0))::numeric / v_total_units::numeric) * 100
      )
    )
  end;

  insert into public.course_progress (
    enrollment_id,
    student_id,
    course_id,
    completion_percent,
    lessons_completed,
    last_accessed_at,
    last_lesson_id,
    updated_at
  )
  values (
    v_enrollment_id,
    p_student_id,
    p_course_id,
    v_completion_percent,
    coalesce(v_completed_lessons, 0),
    v_now,
    p_last_lesson_id,
    v_now
  )
  on conflict (student_id, course_id)
  do update set
    enrollment_id = excluded.enrollment_id,
    completion_percent = excluded.completion_percent,
    lessons_completed = excluded.lessons_completed,
    last_accessed_at = excluded.last_accessed_at,
    last_lesson_id = coalesce(excluded.last_lesson_id, public.course_progress.last_lesson_id),
    updated_at = excluded.updated_at;

  if v_enrollment_status in ('active', 'completed') then
    update public.enrollments
    set status = case when v_completion_percent >= 100 then 'completed' else 'active' end,
        completed_at = case when v_completion_percent >= 100 then coalesce(completed_at, v_now) else null end,
        updated_at = v_now
    where id = v_enrollment_id;
  end if;

  if v_completion_percent >= 100 then
    insert into public.certificates (student_id, course_id, issued_at)
    select p_student_id, p_course_id, v_now
    where not exists (
      select 1
      from public.certificates
      where student_id = p_student_id
        and course_id = p_course_id
    );
  end if;

  return jsonb_build_object(
    'student_id', p_student_id,
    'course_id', p_course_id,
    'completion_percent', v_completion_percent,
    'completed_lessons', coalesce(v_completed_lessons, 0),
    'passed_assignments', coalesce(v_passed_assignments, 0),
    'total_lessons', coalesce(v_total_lessons, 0),
    'total_assignments', coalesce(v_total_assignments, 0),
    'total_units', v_total_units
  );
end;
$$;

revoke all on function public.recalculate_course_progress(uuid, uuid, uuid) from public;
grant execute on function public.recalculate_course_progress(uuid, uuid, uuid) to authenticated;

drop policy if exists "lms_write_staff_course_progress" on public.course_progress;
drop policy if exists "lms_insert_own_or_staff_course_progress" on public.course_progress;
drop policy if exists "lms_update_own_or_staff_course_progress" on public.course_progress;
drop policy if exists "lms_insert_staff_course_progress" on public.course_progress;
drop policy if exists "lms_update_staff_course_progress" on public.course_progress;
drop policy if exists "lms_delete_staff_course_progress" on public.course_progress;

create policy "lms_insert_staff_course_progress"
on public.course_progress
for insert
to authenticated
with check (private.is_staff((select auth.uid())));

create policy "lms_update_staff_course_progress"
on public.course_progress
for update
to authenticated
using (private.is_staff((select auth.uid())))
with check (private.is_staff((select auth.uid())));

create policy "lms_delete_staff_course_progress"
on public.course_progress
for delete
to authenticated
using (private.is_staff((select auth.uid())));

drop policy if exists "lms_select_own_progress" on public.progress;
drop policy if exists "lms_write_own_progress" on public.progress;
drop policy if exists "lms_insert_own_progress" on public.progress;
drop policy if exists "lms_update_own_progress" on public.progress;
drop policy if exists "lms_delete_own_progress" on public.progress;

create policy "lms_select_own_progress"
on public.progress
for select
to authenticated
using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

create policy "lms_insert_own_progress"
on public.progress
for insert
to authenticated
with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

create policy "lms_update_own_progress"
on public.progress
for update
to authenticated
using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())))
with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

create policy "lms_delete_own_progress"
on public.progress
for delete
to authenticated
using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

commit;
