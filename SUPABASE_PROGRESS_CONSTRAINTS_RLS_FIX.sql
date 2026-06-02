-- Redline Academy LMS progress integrity + RLS compatibility fix.
-- Run this separately in the Supabase SQL Editor after reviewing any raised
-- duplicate/null-data errors. This migration is intentionally non-destructive.
-- Security note: allowing students to write course_progress is acceptable for
-- demo/staging so lesson completion can update instantly from the dashboard.
-- For production, prefer server-side progress aggregation through an Edge
-- Function or RPC that validates course ownership, lesson completion, and
-- passed assignments before writing aggregate course_progress.

-- PREFLIGHT: run/review these result sets before applying the migration.
-- Every issue_count should be 0. If not, clean or merge the listed data first.
select
  'progress_null_student_or_lesson' as check_name,
  count(*) as issue_count
from public.progress
where student_id is null
   or lesson_id is null;

select
  'progress_duplicate_student_lesson' as check_name,
  count(*) as issue_count
from (
  select student_id, lesson_id
  from public.progress
  group by student_id, lesson_id
  having count(*) > 1
) duplicates;

select
  'course_progress_duplicate_student_course' as check_name,
  count(*) as issue_count
from (
  select student_id, course_id
  from public.course_progress
  group by student_id, course_id
  having count(*) > 1
) duplicates;

begin;

do $$
begin
  if exists (
    select 1
    from public.progress
    where student_id is null
       or lesson_id is null
  ) then
    raise exception 'Cannot add progress_student_lesson_unique: public.progress contains null student_id or lesson_id rows. Clean those rows first.';
  end if;

  if exists (
    select 1
    from public.progress
    group by student_id, lesson_id
    having count(*) > 1
  ) then
    raise exception 'Cannot add progress_student_lesson_unique: public.progress contains duplicate student_id + lesson_id rows. Merge duplicates first.';
  end if;

  if exists (
    select 1
    from public.course_progress
    group by student_id, course_id
    having count(*) > 1
  ) then
    raise exception 'Cannot add course_progress_student_course_unique: public.course_progress contains duplicate student_id + course_id rows. Merge duplicates first.';
  end if;
end $$;

alter table public.progress
  alter column student_id set not null,
  alter column lesson_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'progress_student_lesson_unique'
      and conrelid = 'public.progress'::regclass
  ) then
    alter table public.progress
      add constraint progress_student_lesson_unique unique (student_id, lesson_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'course_progress_student_course_unique'
      and conrelid = 'public.course_progress'::regclass
  ) then
    alter table public.course_progress
      add constraint course_progress_student_course_unique unique (student_id, course_id);
  end if;
end $$;

drop policy if exists "lms_select_own_progress" on public.progress;
drop policy if exists "lms_write_own_progress" on public.progress;

create policy "lms_select_own_progress"
on public.progress
for select
to authenticated
using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

create policy "lms_write_own_progress"
on public.progress
for all
to authenticated
using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())))
with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_course_progress" on public.course_progress;
drop policy if exists "lms_insert_own_or_staff_course_progress" on public.course_progress;
drop policy if exists "lms_update_own_or_staff_course_progress" on public.course_progress;
drop policy if exists "lms_delete_staff_course_progress" on public.course_progress;

create policy "lms_insert_own_or_staff_course_progress"
on public.course_progress
for insert
to authenticated
with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

create policy "lms_update_own_or_staff_course_progress"
on public.course_progress
for update
to authenticated
using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())))
with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

create policy "lms_delete_staff_course_progress"
on public.course_progress
for delete
to authenticated
using (private.is_staff((select auth.uid())));

commit;
