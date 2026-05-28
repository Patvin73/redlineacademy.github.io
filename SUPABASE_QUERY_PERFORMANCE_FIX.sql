-- Supabase query performance indexes for dashboard messages/notifications.
-- Run this once in Supabase SQL Editor. Statements are idempotent.

create index if not exists idx_notifications_user_created_at
  on public.notifications(user_id, created_at desc);

create index if not exists idx_messages_recipient_read_created_at
  on public.messages(recipient_id, is_read, created_at desc);

create index if not exists idx_messages_recipient_archived_created_at
  on public.messages(recipient_id, is_archived, created_at desc);

create index if not exists idx_messages_sender_archived_created_at
  on public.messages(sender_id, is_archived, created_at desc);
