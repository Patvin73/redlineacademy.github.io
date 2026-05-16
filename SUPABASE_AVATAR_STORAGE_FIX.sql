-- Fix Supabase Storage RLS for dashboard profile avatar uploads.
-- Safe to run multiple times in Supabase SQL Editor.

create or replace function public.is_staff(user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = user_id
      and role in ('admin', 'trainer')
  );
end;
$$;

revoke all on function public.is_staff(uuid) from public;
grant execute on function public.is_staff(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_insert_own_or_staff" on storage.objects;
drop policy if exists "avatars_update_own_or_staff" on storage.objects;
drop policy if exists "avatars_delete_own_or_staff" on storage.objects;

create policy "avatars_public_read"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "avatars_insert_own_or_staff"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
    or public.is_staff(auth.uid())
  )
);

create policy "avatars_update_own_or_staff"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
    or public.is_staff(auth.uid())
  )
)
with check (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
    or public.is_staff(auth.uid())
  )
);

create policy "avatars_delete_own_or_staff"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '.%')
    or name like ('avatars/' || auth.uid()::text || '.%')
    or public.is_staff(auth.uid())
  )
);
