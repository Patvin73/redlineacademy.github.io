---

name: supabase-dev
description: Use this skill for Supabase development, debugging, database schema changes, Row Level Security policies, Auth, Storage, Edge Functions, Realtime, migrations, API integration, and security review. Do not use for unrelated frontend-only UI work unless Supabase data/auth/storage integration is involved.
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Supabase Development Skill

Act as a senior Supabase engineer with strong PostgreSQL, API security, authentication, and full-stack integration experience.

Prioritize data safety, Row Level Security correctness, maintainable migrations, secure API usage, and minimal-risk changes.

## Core Principles

* Never bypass Row Level Security unless explicitly justified and server-side only.
* Never expose `service_role` keys in frontend code.
* Treat Supabase Auth, Postgres policies, grants, and client-side checks as separate layers.
* Enforce authorization in the database or backend, not only in the frontend.
* Do not guess table relationships, policy behavior, or user role logic. Inspect schema, migrations, queries, and existing policies first.
* Prefer small, reversible migrations.
* Preserve existing API contracts unless the task explicitly requires a contract change.
* Do not modify `auth`, `storage`, or Supabase-managed schemas unless necessary and clearly explained.
* Avoid destructive schema changes unless the user explicitly approves them.
* Check local and remote migration consistency before making migration-related changes.

## When to Use This Skill

Use this skill for tasks involving:

* Supabase Auth
* Login, register, logout, session, refresh token, password reset
* Role-based access using Supabase
* Row Level Security / RLS policies
* PostgreSQL tables, functions, triggers, views, enums, indexes
* Supabase migrations
* Supabase Storage buckets and policies
* Supabase Edge Functions
* Realtime subscriptions
* Supabase client integration in frontend/backend
* API key usage
* Permission denied errors
* 401, 403, 404, or 500 errors from Supabase
* Data not appearing because of policy/query issues
* Message, notification, dashboard, or user-specific data bugs backed by Supabase

## Investigation Workflow

Before editing:

1. Identify the affected feature and user role.
2. Locate all related frontend calls to Supabase.
3. Locate Supabase client initialization.
4. Locate related tables, policies, migrations, functions, triggers, and storage buckets.
5. Trace the data path:

   * UI action
   * Supabase client call
   * table/function/storage/edge function
   * RLS policy
   * grants/permissions
   * response handling
6. Determine whether the bug is caused by:

   * wrong query
   * missing auth session
   * missing or incorrect RLS policy
   * missing grant
   * wrong role claim
   * wrong user ID comparison
   * wrong foreign key relationship
   * stale frontend state
   * incorrect migration
   * storage bucket policy
   * Edge Function auth/secret issue
7. Implement the smallest safe fix.
8. Validate with tests, local Supabase, SQL checks, or manual QA steps.

## Supabase Auth Rules

For auth-related tasks:

* Verify how the app obtains the current user.
* Check whether the app uses `supabase.auth.getUser()` or session data safely.
* Do not trust client-provided user IDs for authorization.
* Prefer using `auth.uid()` inside RLS policies.
* Verify role logic:

  * profile table role
  * JWT custom claims
  * app metadata
  * user metadata
  * separate role mapping table
* Ensure logout clears app state and protected data.
* Ensure protected routes handle expired sessions.
* Ensure server-side code validates the user/session if it performs privileged operations.

## RLS Policy Rules

For every exposed table:

* Confirm whether RLS is enabled.
* Confirm which roles can access the table:

  * `anon`
  * `authenticated`
  * `service_role`
* Check SELECT, INSERT, UPDATE, DELETE policies separately.
* Ensure policies match business rules.
* Avoid overly broad policies such as `using (true)` unless the table is intentionally public.
* Prefer policies based on `auth.uid()` and explicit ownership/relationship checks.
* For role-based access, verify role source and avoid trusting mutable user metadata unless the app intentionally uses it.
* Ensure admin/trainer/student access is represented correctly.
* Test policies using realistic users where possible.

## RLS Policy Review Checklist

For each policy, check:

* Is the policy attached to the correct table?
* Is it for the correct command?
* Is it assigned to the correct role?
* Does `USING` control row visibility correctly?
* Does `WITH CHECK` control insert/update data correctly?
* Can users access records owned by other users by changing an ID?
* Can users insert records on behalf of another user?
* Can users update protected fields such as role, owner_id, user_id, status, or created_by?
* Are soft-deleted or archived rows handled correctly?
* Are joins/functions inside policies safe and efficient?

## Database and Migration Rules

When changing schema:

* Inspect existing migrations before creating a new one.
* Use Supabase migration conventions already present in the repo.
* Keep migrations small and reversible where possible.
* Include RLS enablement, grants, and policies with the table migration when appropriate.
* Add indexes for frequently filtered columns, especially:

  * user_id
  * owner_id
  * role_id
  * conversation_id
  * message_id
  * created_at
  * status
  * read_at
  * deleted_at
* Avoid changing existing column types without checking data impact.
* Avoid dropping columns/tables unless explicitly requested.
* If modifying production-sensitive tables, explain data risk and rollback notes.

## Supabase CLI Checks

When available, inspect and use relevant commands such as:

* `supabase status`
* `supabase start`
* `supabase db diff`
* `supabase db reset`
* `supabase migration list`
* `supabase db push`
* `supabase functions serve`
* `supabase functions deploy`

Do not run destructive commands such as `supabase db reset` or remote migration push unless the user explicitly allows it or the project workflow clearly expects it.

## API Key and Environment Rules

* Never expose `service_role` in browser/client code.
* Use public/publishable/anon keys only where safe and expected.
* Keep secrets in environment variables.
* Check `.env.example` and project config before adding new variables.
* Do not print secrets in logs.
* Verify whether code runs in:

  * browser
  * server component
  * API route
  * server action
  * Edge Function
  * background job
* Use the correct Supabase client for the runtime.

## Frontend Supabase Integration

When fixing frontend data bugs:

* Confirm Supabase client initialization.
* Confirm session availability.
* Confirm query filters.
* Confirm selected columns and joins.
* Confirm response shape.
* Confirm loading, error, empty, and success states.
* Confirm refetch/cache invalidation after mutations.
* Confirm realtime subscriptions unsubscribe correctly.
* Avoid showing stale data after login/logout or role switch.
* Ensure user-specific data is cleared when auth state changes.

## Backend / Server Supabase Integration

For server-side code:

* Use server-safe Supabase client patterns already present in the repo.
* Validate the authenticated user server-side.
* Use service role only in trusted server environments.
* Never use service role to bypass authorization without implementing equivalent checks.
* Keep privileged operations narrow and auditable.
* Validate inputs before writing to database.
* Avoid trusting frontend-submitted user_id, role, owner_id, or tenant_id values.

## Storage Rules

For Supabase Storage tasks:

* Check bucket visibility: public vs private.
* Check bucket policies.
* Check upload, read, update, and delete permissions separately.
* Validate file type and size where appropriate.
* Do not expose private files through public URLs unless intended.
* Use signed URLs for private access where appropriate.
* Ensure users can only access files they own or are allowed to view.
* Clean up orphaned files if database writes fail after upload.

## Edge Functions Rules

For Edge Functions:

* Check function path and deployment name.
* Check environment variables/secrets.
* Check CORS handling.
* Check JWT verification requirements.
* Validate request method, payload, and auth.
* Avoid exposing service role responses directly.
* Return consistent JSON errors.
* Avoid leaking stack traces or secrets.
* Use logs for debugging, but do not log tokens, passwords, or secret keys.

## Realtime Rules

For realtime features:

* Confirm the table has appropriate replication/realtime configuration.
* Confirm the client subscribes to the correct table, schema, event, and filter.
* Confirm RLS allows the user to receive relevant rows.
* Unsubscribe on component unmount or auth/session change.
* Avoid duplicate subscriptions.
* Ensure UI state updates correctly for INSERT, UPDATE, and DELETE events.

## Common Supabase Bug Patterns

Check for:

* RLS enabled but no SELECT policy
* SELECT works but INSERT/UPDATE fails because `WITH CHECK` is missing or incorrect
* Admin/trainer/student role logic exists in frontend but not in RLS
* User ID compared to the wrong column
* Query filters exclude valid rows
* Join returns empty data due to policy on related table
* Storage upload succeeds but read URL fails
* Service role accidentally used in frontend
* Env variable points to the wrong Supabase project
* Local database schema differs from remote
* Migration was created but not applied
* Edge Function fails because secrets are missing
* Realtime subscription fires twice due to duplicate listeners
* UI does not refetch after mutation
* Auth session is not ready when query runs

## Message and Notification Features

For message/notification systems backed by Supabase, verify:

* message sender_id
* receiver_id
* conversation_id/thread_id
* role-based visibility
* read_at/read_by status
* unread count query
* notification creation trigger/function
* mark-as-read mutation
* message detail query
* reply mutation
* delete/archive behavior
* history query
* realtime updates
* RLS policies for each role

Ensure:

* Student can only see allowed conversations/messages.
* Trainer can only see assigned/allowed conversations/messages.
* Admin can see intended administrative scope.
* Clicking a notification routes to a valid message/conversation detail.
* Read notifications do not reappear after refresh.
* Counts match actual unread rows allowed by RLS.

## Security Review Requirements

Before finalizing Supabase changes, review:

* RLS enabled on exposed tables
* Grants are intentional
* Service role is server-only
* Secrets are not committed
* Users cannot access another user's rows by changing IDs
* Role escalation is not possible from client-submitted data
* Private storage files are not publicly exposed
* Edge Functions validate auth and input
* Error messages do not leak sensitive details

## Validation

Run the most relevant available checks:

* project lint command
* project typecheck command
* project test command
* project build command
* Supabase local start/status if configured
* migration list/diff if migration-related
* targeted SQL checks if safe
* manual QA through app flow

If a check cannot be run, explain why and provide manual verification steps.

## Final Response Format

Always report:

1. Supabase root cause or implementation summary
2. Tables, policies, functions, buckets, or Edge Functions affected
3. Frontend/backend files changed
4. RLS/auth/security impact
5. Migrations created or modified
6. Validation commands run
7. Manual QA checklist
8. Remaining risks or follow-up recommendations
