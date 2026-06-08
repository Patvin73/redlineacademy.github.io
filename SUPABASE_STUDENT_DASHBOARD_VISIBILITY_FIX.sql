-- Redline Academy LMS student dashboard visibility fix.
-- Run this in Supabase SQL Editor when student dashboard stats, assignments,
-- or schedules stay empty even though trainer/admin data exists.

begin;

-- Keep the dashboard view type-compatible with the existing JS contract.
create or replace view public.v_student_dashboard with (security_invoker = true) as
select
  e.student_id,
  (
    count(distinct e.course_id) filter (
      where lower(coalesce(e.status, 'active')) not in ('completed','inactive','dropped','cancelled','suspended')
    )
  )::int as courses_enrolled,
  coalesce(sum(p.completed::int), 0)::int as lessons_completed,
  (
    count(distinct sub.id) filter (
      where sub.status in ('pending','resubmit_required')
    )
  )::int as pending_submissions,
  count(distinct cert.id)::int as certificates_earned
from public.enrollments e
left join public.progress p on p.student_id = e.student_id
left join public.assignment_submissions sub on sub.student_id = e.student_id
left join public.certificates cert on cert.student_id = e.student_id
group by e.student_id;

grant select on public.v_student_dashboard to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.courses to authenticated;
grant select on public.enrollments to authenticated;
grant select on public.assignments to authenticated;
grant select, insert, update on public.assignment_submissions to authenticated;
grant select on public.schedules to authenticated;

drop policy if exists "trainer_read_courses_for_grading" on public.courses;
create policy "trainer_read_courses_for_grading"
on public.courses
for select
to authenticated
using (
  status = 'published'
  or trainer_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

drop policy if exists "trainer_read_assignments_for_grading" on public.assignments;
create policy "trainer_read_assignments_for_grading"
on public.assignments
for select
to authenticated
using (
  trainer_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
  or exists (
    select 1
    from public.courses c
    where c.id = assignments.course_id
      and c.trainer_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.enrollments e
    where e.student_id = (select auth.uid())
      and e.course_id = assignments.course_id
  )
);

-- Student must be able to read their own enrollment rows. Without this,
-- dashboard stats, assignments, schedules, and materials all look empty.
drop policy if exists "student_read_own_enrollments" on public.enrollments;
create policy "student_read_own_enrollments"
on public.enrollments
for select
to authenticated
using (
  student_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

-- Student can read assignments for courses they are enrolled in.
drop policy if exists "student_read_enrolled_assignments" on public.assignments;
create policy "student_read_enrolled_assignments"
on public.assignments
for select
to authenticated
using (
  private.is_staff((select auth.uid()))
  or exists (
    select 1
    from public.enrollments e
    where e.student_id = (select auth.uid())
      and e.course_id = assignments.course_id
  )
);

-- Student can read their own submissions; staff can read all.
drop policy if exists "student_read_own_assignment_submissions" on public.assignment_submissions;
create policy "student_read_own_assignment_submissions"
on public.assignment_submissions
for select
to authenticated
using (
  student_id = (select auth.uid())
  or exists (
    select 1
    from public.assignments a
    where a.id = assignment_submissions.assignment_id
      and a.trainer_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.assignments a
    join public.courses c on c.id = a.course_id
    where a.id = assignment_submissions.assignment_id
      and c.trainer_id = (select auth.uid())
  )
  or private.is_staff((select auth.uid()))
);

drop policy if exists "trainer_read_student_profiles_for_grading" on public.profiles;
create policy "trainer_read_student_profiles_for_grading"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_staff((select auth.uid()))
  or exists (
    select 1
    from public.assignment_submissions sub
    join public.assignments a on a.id = sub.assignment_id
    left join public.courses c on c.id = a.course_id
    where sub.student_id = profiles.id
      and (
        a.trainer_id = (select auth.uid())
        or c.trainer_id = (select auth.uid())
      )
  )
);

drop policy if exists "student_insert_own_assignment_submissions" on public.assignment_submissions;
create policy "student_insert_own_assignment_submissions"
on public.assignment_submissions
for insert
to authenticated
with check (
  student_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

drop policy if exists "student_update_own_assignment_submissions" on public.assignment_submissions;
create policy "student_update_own_assignment_submissions"
on public.assignment_submissions
for update
to authenticated
using (
  student_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
)
with check (
  student_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

-- Student can read schedules for enrolled courses and global schedules.
drop policy if exists "student_read_enrolled_or_global_schedules" on public.schedules;
create policy "student_read_enrolled_or_global_schedules"
on public.schedules
for select
to authenticated
using (
  private.is_staff((select auth.uid()))
  or course_id is null
  or exists (
    select 1
    from public.enrollments e
    where e.student_id = (select auth.uid())
      and e.course_id = schedules.course_id
  )
);

commit;
