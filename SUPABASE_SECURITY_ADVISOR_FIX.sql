-- Fix Supabase Security Advisor warnings:
-- - public_bucket_allows_listing for avatars and assignment-submissions
-- - authenticated_security_definer_function_executable for is_admin and is_staff
-- Fix Supabase Performance Advisor warnings:
-- - auth_rls_initplan by evaluating auth.uid() once per statement in RLS policies
-- - multiple_permissive_policies by removing obsolete overlapping live policies
--
-- Safe to run multiple times in Supabase SQL Editor.

create schema if not exists private;
grant usage on schema private to authenticated, service_role;

do $$
begin
  if to_regprocedure('private.is_admin(uuid)') is null
     and to_regprocedure('public.is_admin(uuid)') is not null then
    alter function public.is_admin(uuid) set schema private;
  end if;

  if to_regprocedure('private.is_staff(uuid)') is null
     and to_regprocedure('public.is_staff(uuid)') is not null then
    alter function public.is_staff(uuid) set schema private;
  end if;
end;
$$;

create or replace function private.is_admin(user_id uuid)
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

create or replace function private.is_staff(user_id uuid)
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

revoke all on function private.is_admin(uuid) from public;
revoke all on function private.is_staff(uuid) from public;
grant execute on function private.is_admin(uuid) to authenticated, service_role;
grant execute on function private.is_staff(uuid) to authenticated, service_role;

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

  if private.is_admin(v_uid) then
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

drop policy if exists "profiles_select_self_or_staff" on public.profiles;
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_staff" on public.profiles for select to authenticated using ((select auth.uid()) = id or private.is_staff((select auth.uid())));
create policy "profiles_update_self_or_admin" on public.profiles for update to authenticated using ((select auth.uid()) = id or private.is_admin((select auth.uid()))) with check ((select auth.uid()) = id or private.is_admin((select auth.uid())));

drop policy if exists "lms_write_staff_courses" on public.courses;
drop policy if exists "lms_insert_staff_courses" on public.courses;
drop policy if exists "lms_update_staff_courses" on public.courses;
drop policy if exists "lms_delete_staff_courses" on public.courses;
create policy "lms_insert_staff_courses" on public.courses for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_courses" on public.courses for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_courses" on public.courses for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_enrollments" on public.enrollments;
drop policy if exists "lms_insert_staff_enrollments" on public.enrollments;
drop policy if exists "lms_update_staff_enrollments" on public.enrollments;
drop policy if exists "lms_delete_staff_enrollments" on public.enrollments;
create policy "lms_insert_staff_enrollments" on public.enrollments for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_enrollments" on public.enrollments for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_enrollments" on public.enrollments for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_course_progress" on public.course_progress;
drop policy if exists "lms_insert_staff_course_progress" on public.course_progress;
drop policy if exists "lms_update_staff_course_progress" on public.course_progress;
drop policy if exists "lms_delete_staff_course_progress" on public.course_progress;
create policy "lms_insert_staff_course_progress" on public.course_progress for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_course_progress" on public.course_progress for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_course_progress" on public.course_progress for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_assignments" on public.assignments;
drop policy if exists "lms_insert_staff_assignments" on public.assignments;
drop policy if exists "lms_update_staff_assignments" on public.assignments;
drop policy if exists "lms_delete_staff_assignments" on public.assignments;
drop policy if exists "student_read_enrolled_assignments" on public.assignments;
drop policy if exists "trainer_manage_own_assignments" on public.assignments;
create policy "lms_insert_staff_assignments" on public.assignments for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_assignments" on public.assignments for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_assignments" on public.assignments for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_submissions" on public.assignment_submissions;
drop policy if exists "lms_student_insert_own_submission" on public.assignment_submissions;
create policy "lms_write_staff_submissions" on public.assignment_submissions for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_student_insert_own_submission" on public.assignment_submissions for insert to authenticated with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_schedules" on public.schedules;
drop policy if exists "lms_insert_staff_schedules" on public.schedules;
drop policy if exists "lms_update_staff_schedules" on public.schedules;
drop policy if exists "lms_delete_staff_schedules" on public.schedules;
create policy "lms_insert_staff_schedules" on public.schedules for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_schedules" on public.schedules for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_schedules" on public.schedules for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_forum_posts" on public.forum_posts;
drop policy if exists "lms_insert_own_forum_posts" on public.forum_posts;
create policy "lms_write_staff_forum_posts" on public.forum_posts for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_insert_own_forum_posts" on public.forum_posts for insert to authenticated with check (author_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "messages_select_participants_or_staff" on public.messages;
drop policy if exists "messages_insert_sender_or_staff" on public.messages;
drop policy if exists "messages_update_participants_or_staff" on public.messages;
drop policy if exists "messages_delete_participants_or_staff" on public.messages;
drop policy if exists "messages_archive_own" on public.messages;
create policy "messages_select_participants_or_staff" on public.messages for select to authenticated using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "messages_insert_sender_or_staff" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "messages_update_participants_or_staff" on public.messages for update to authenticated using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()) or private.is_staff((select auth.uid()))) with check (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "messages_delete_participants_or_staff" on public.messages for delete to authenticated using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "notifications_select_owner_or_staff" on public.notifications;
drop policy if exists "notifications_insert_owner_or_staff" on public.notifications;
drop policy if exists "notifications_update_owner_or_staff" on public.notifications;
create policy "notifications_select_owner_or_staff" on public.notifications for select to authenticated using (user_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "notifications_insert_owner_or_staff" on public.notifications for insert to authenticated with check (user_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "notifications_update_owner_or_staff" on public.notifications for update to authenticated using (user_id = (select auth.uid()) or private.is_staff((select auth.uid()))) with check (user_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_announcements" on public.announcements;
drop policy if exists "lms_insert_staff_announcements" on public.announcements;
drop policy if exists "lms_update_staff_announcements" on public.announcements;
drop policy if exists "lms_delete_staff_announcements" on public.announcements;
create policy "lms_insert_staff_announcements" on public.announcements for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_announcements" on public.announcements for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_announcements" on public.announcements for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_payments" on public.payments;
drop policy if exists "lms_insert_staff_payments" on public.payments;
drop policy if exists "lms_update_staff_payments" on public.payments;
drop policy if exists "lms_delete_staff_payments" on public.payments;
create policy "lms_insert_staff_payments" on public.payments for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_payments" on public.payments for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_payments" on public.payments for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_certificates" on public.certificates;
drop policy if exists "lms_insert_staff_certificates" on public.certificates;
drop policy if exists "lms_update_staff_certificates" on public.certificates;
drop policy if exists "lms_delete_staff_certificates" on public.certificates;
create policy "lms_insert_staff_certificates" on public.certificates for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_certificates" on public.certificates for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_certificates" on public.certificates for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_insert_own_or_staff_activity_logs" on public.activity_logs;
create policy "lms_insert_own_or_staff_activity_logs" on public.activity_logs for insert to authenticated with check (user_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "lms_write_staff_lessons" on public.lessons;
drop policy if exists "lms_insert_staff_lessons" on public.lessons;
drop policy if exists "lms_update_staff_lessons" on public.lessons;
drop policy if exists "lms_delete_staff_lessons" on public.lessons;
create policy "lms_insert_staff_lessons" on public.lessons for insert to authenticated with check (private.is_staff((select auth.uid())));
create policy "lms_update_staff_lessons" on public.lessons for update to authenticated using (private.is_staff((select auth.uid()))) with check (private.is_staff((select auth.uid())));
create policy "lms_delete_staff_lessons" on public.lessons for delete to authenticated using (private.is_staff((select auth.uid())));

drop policy if exists "lms_select_own_progress" on public.progress;
drop policy if exists "lms_write_own_progress" on public.progress;
drop policy if exists "lms_insert_own_progress" on public.progress;
drop policy if exists "lms_update_own_progress" on public.progress;
drop policy if exists "lms_delete_own_progress" on public.progress;
create policy "lms_select_own_progress" on public.progress for select to authenticated using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "lms_insert_own_progress" on public.progress for insert to authenticated with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "lms_update_own_progress" on public.progress for update to authenticated using (student_id = (select auth.uid()) or private.is_staff((select auth.uid()))) with check (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));
create policy "lms_delete_own_progress" on public.progress for delete to authenticated using (student_id = (select auth.uid()) or private.is_staff((select auth.uid())));

drop policy if exists "lms_select_own_marketers" on public.marketers;
drop policy if exists "lms_write_staff_marketers" on public.marketers;
drop policy if exists "lms_insert_staff_marketers" on public.marketers;
drop policy if exists "lms_update_staff_marketers" on public.marketers;
drop policy if exists "lms_delete_staff_marketers" on public.marketers;
create policy "lms_select_own_marketers" on public.marketers for select to authenticated using (user_id = (select auth.uid()) or private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));
create policy "lms_insert_staff_marketers" on public.marketers for insert to authenticated with check (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));
create policy "lms_update_staff_marketers" on public.marketers for update to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid()))) with check (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));
create policy "lms_delete_staff_marketers" on public.marketers for delete to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));

drop policy if exists "lms_select_own_referrals" on public.referrals;
drop policy if exists "lms_write_staff_referrals" on public.referrals;
drop policy if exists "lms_insert_staff_referrals" on public.referrals;
drop policy if exists "lms_update_staff_referrals" on public.referrals;
drop policy if exists "lms_delete_staff_referrals" on public.referrals;
create policy "lms_select_own_referrals" on public.referrals for select to authenticated using (
  private.is_admin((select auth.uid()))
  or private.is_staff((select auth.uid()))
  or exists (
    select 1
    from public.marketers m
    where m.id = referrals.marketer_id
      and m.user_id = (select auth.uid())
  )
);
create policy "lms_insert_staff_referrals" on public.referrals for insert to authenticated with check (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));
create policy "lms_update_staff_referrals" on public.referrals for update to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid()))) with check (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));
create policy "lms_delete_staff_referrals" on public.referrals for delete to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));

drop policy if exists "lms_select_staff_audit_logs" on public.audit_logs;
drop policy if exists "lms_write_staff_audit_logs" on public.audit_logs;
create policy "lms_select_staff_audit_logs" on public.audit_logs for select to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));
create policy "lms_write_staff_audit_logs" on public.audit_logs for insert to authenticated with check (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));

drop policy if exists "payments_select_staff_registrations" on public.registrations;
create policy "payments_select_staff_registrations" on public.registrations for select to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));

drop policy if exists "payments_select_staff_payment_events" on public.payment_events;
create policy "payments_select_staff_payment_events" on public.payment_events for select to authenticated using (private.is_admin((select auth.uid())) or private.is_staff((select auth.uid())));

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_staff_read" on storage.objects;
drop policy if exists "avatars_read" on storage.objects;
drop policy if exists "avatars_insert_own_or_staff" on storage.objects;
drop policy if exists "avatars_update_own_or_staff" on storage.objects;
drop policy if exists "avatars_delete_own_or_staff" on storage.objects;
create policy "avatars_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (
    name like ((select auth.uid())::text || '.%')
    or name like ('avatars/' || (select auth.uid())::text || '.%')
    or private.is_staff((select auth.uid()))
  )
);
create policy "avatars_insert_own_or_staff" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (name like ((select auth.uid())::text || '.%') or name like ('avatars/' || (select auth.uid())::text || '.%') or private.is_staff((select auth.uid()))));
create policy "avatars_update_own_or_staff" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (name like ((select auth.uid())::text || '.%') or name like ('avatars/' || (select auth.uid())::text || '.%') or private.is_staff((select auth.uid())))) with check (bucket_id = 'avatars' and (name like ((select auth.uid())::text || '.%') or name like ('avatars/' || (select auth.uid())::text || '.%') or private.is_staff((select auth.uid()))));
create policy "avatars_delete_own_or_staff" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (name like ((select auth.uid())::text || '.%') or name like ('avatars/' || (select auth.uid())::text || '.%') or private.is_staff((select auth.uid()))));

drop policy if exists "course_materials_staff_insert" on storage.objects;
drop policy if exists "course_materials_staff_update" on storage.objects;
drop policy if exists "course_materials_staff_delete" on storage.objects;
create policy "course_materials_staff_insert" on storage.objects for insert to authenticated with check (bucket_id = 'course-materials' and private.is_staff((select auth.uid())));
create policy "course_materials_staff_update" on storage.objects for update to authenticated using (bucket_id = 'course-materials' and private.is_staff((select auth.uid()))) with check (bucket_id = 'course-materials' and private.is_staff((select auth.uid())));
create policy "course_materials_staff_delete" on storage.objects for delete to authenticated using (bucket_id = 'course-materials' and private.is_staff((select auth.uid())));

drop policy if exists "assignment_submissions_public_read" on storage.objects;
drop policy if exists "assignment_submissions_staff_read" on storage.objects;
drop policy if exists "assignment_submissions_read" on storage.objects;
drop policy if exists "assignment_submissions_insert_own_or_staff" on storage.objects;
drop policy if exists "assignment_submissions_update_own_or_staff" on storage.objects;
drop policy if exists "assignment_submissions_delete_own_or_staff" on storage.objects;
create policy "assignment_submissions_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'assignment-submissions'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.is_staff((select auth.uid()))
  )
);
create policy "assignment_submissions_insert_own_or_staff" on storage.objects for insert to authenticated with check (bucket_id = 'assignment-submissions' and (name like ((select auth.uid())::text || '/%') or private.is_staff((select auth.uid()))));
create policy "assignment_submissions_update_own_or_staff" on storage.objects for update to authenticated using (bucket_id = 'assignment-submissions' and (name like ((select auth.uid())::text || '/%') or private.is_staff((select auth.uid())))) with check (bucket_id = 'assignment-submissions' and (name like ((select auth.uid())::text || '/%') or private.is_staff((select auth.uid()))));
create policy "assignment_submissions_delete_own_or_staff" on storage.objects for delete to authenticated using (bucket_id = 'assignment-submissions' and (name like ((select auth.uid())::text || '/%') or private.is_staff((select auth.uid()))));

drop function if exists public.is_admin(uuid);
drop function if exists public.is_staff(uuid);
