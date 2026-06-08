-- Redline Academy LMS student dashboard audit.
-- Replace the email value below, then run in Supabase SQL Editor.
-- This is read-only and helps identify why student stats/assignments remain empty.

with target_student as (
  select id, email, full_name, student_id
  from public.profiles
  where lower(email) = lower('student@example.com')
  limit 1
),
student_enrollments as (
  select e.*
  from public.enrollments e
  join target_student s on s.id = e.student_id
),
student_courses as (
  select c.id, c.title, c.status, c.trainer_id, e.status as enrollment_status
  from student_enrollments e
  join public.courses c on c.id = e.course_id
),
student_assignments as (
  select
    a.id,
    a.course_id,
    a.trainer_id,
    a.title,
    a.type,
    a.due_at,
    a.is_published,
    c.title as course_title,
    sc.enrollment_status,
    sub.status as submission_status
  from public.assignments a
  left join public.courses c on c.id = a.course_id
  left join student_courses sc on sc.id = a.course_id
  left join target_student s on true
  left join public.assignment_submissions sub
    on sub.assignment_id = a.id
   and sub.student_id = s.id
)
select
  'profile' as section,
  jsonb_agg(to_jsonb(target_student.*)) as rows
from target_student
union all
select
  'enrollments',
  coalesce(jsonb_agg(to_jsonb(student_enrollments.*)), '[]'::jsonb)
from student_enrollments
union all
select
  'courses_from_enrollments',
  coalesce(jsonb_agg(to_jsonb(student_courses.*)), '[]'::jsonb)
from student_courses
union all
select
  'assignments_for_enrolled_courses',
  coalesce(jsonb_agg(to_jsonb(student_assignments.*)), '[]'::jsonb)
from student_assignments
where enrollment_status is not null
union all
select
  'assignments_recent_any_course',
  coalesce(jsonb_agg(to_jsonb(recent_assignments.*)), '[]'::jsonb)
from (
  select
    a.id,
    a.course_id,
    a.trainer_id,
    a.title,
    a.type,
    a.due_at,
    a.is_published,
    c.title as course_title
  from public.assignments a
  left join public.courses c on c.id = a.course_id
  order by a.created_at desc nulls last
  limit 10
) recent_assignments
union all
select
  'v_student_dashboard',
  coalesce(jsonb_agg(to_jsonb(v.*)), '[]'::jsonb)
from public.v_student_dashboard v
join target_student s on s.id = v.student_id;

