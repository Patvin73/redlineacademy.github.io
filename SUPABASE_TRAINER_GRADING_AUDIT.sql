-- Redline Academy LMS trainer grading audit.
-- Replace the email values below, then run in Supabase SQL Editor.
-- This is read-only and checks whether submitted assignment rows exist and are visible by course/trainer ownership.

with target_student as (
  select id, email, full_name, student_id
  from public.profiles
  where lower(email) = lower('student@example.com')
  limit 1
),
target_trainer as (
  select id, email, full_name, admin_id
  from public.profiles
  where lower(email) = lower('trainer@example.com')
  limit 1
),
student_submissions as (
  select
    sub.id,
    sub.student_id,
    sub.assignment_id,
    sub.status,
    sub.submitted_at,
    sub.file_urls,
    a.title as assignment_title,
    a.trainer_id as assignment_trainer_id,
    a.course_id,
    c.title as course_title,
    c.trainer_id as course_trainer_id
  from public.assignment_submissions sub
  join target_student s on s.id = sub.student_id
  left join public.assignments a on a.id = sub.assignment_id
  left join public.courses c on c.id = a.course_id
),
trainer_course_assignments as (
  select
    a.id,
    a.title,
    a.trainer_id as assignment_trainer_id,
    a.course_id,
    c.title as course_title,
    c.trainer_id as course_trainer_id
  from public.assignments a
  left join public.courses c on c.id = a.course_id
  join target_trainer t on t.id = a.trainer_id or t.id = c.trainer_id
),
trainer_visible_submissions as (
  select
    sub.id,
    sub.student_id,
    p.email as student_email,
    sub.assignment_id,
    sub.status,
    sub.submitted_at,
    sub.file_urls,
    tca.title as assignment_title,
    tca.assignment_trainer_id,
    tca.course_id,
    tca.course_title,
    tca.course_trainer_id
  from public.assignment_submissions sub
  join trainer_course_assignments tca on tca.id = sub.assignment_id
  left join public.profiles p on p.id = sub.student_id
)
select
  'student' as section,
  coalesce(jsonb_agg(to_jsonb(target_student.*)), '[]'::jsonb) as rows
from target_student
union all
select
  'trainer',
  coalesce(jsonb_agg(to_jsonb(target_trainer.*)), '[]'::jsonb)
from target_trainer
union all
select
  'student_submissions',
  coalesce(jsonb_agg(to_jsonb(student_submissions.*)), '[]'::jsonb)
from student_submissions
union all
select
  'trainer_course_assignments',
  coalesce(jsonb_agg(to_jsonb(trainer_course_assignments.*)), '[]'::jsonb)
from trainer_course_assignments
union all
select
  'trainer_visible_submissions',
  coalesce(jsonb_agg(to_jsonb(trainer_visible_submissions.*)), '[]'::jsonb)
from trainer_visible_submissions
where status = 'submitted';
