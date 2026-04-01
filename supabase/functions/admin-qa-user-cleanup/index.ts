import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_PREFIX = "qa-";
const AUTH_PAGE_SIZE = 200;

type AuthUser = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type ProfileRow = {
  id: string;
  email?: string | null;
  role?: string | null;
  full_name?: string | null;
  created_at?: string | null;
};

type Candidate = {
  id: string;
  email: string;
  created_at: string | null;
  profile: ProfileRow | null;
  related_counts: Record<string, number>;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePrefix(value: unknown) {
  const input = String(value || DEFAULT_PREFIX).trim().toLowerCase();
  return input.length > 0 ? input : DEFAULT_PREFIX;
}

async function assertActiveAdmin(userClient: ReturnType<typeof createClient>, adminClient: ReturnType<typeof createClient>) {
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    throw new Error(userErr?.message || "Unauthorized");
  }

  const { data: adminProfile, error: adminErr } = await adminClient
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (adminErr) {
    throw new Error(adminErr.message || "Forbidden");
  }

  if (!adminProfile || adminProfile.role !== "admin" || adminProfile.is_active === false) {
    throw new Error("Forbidden");
  }
}

async function listQaAuthUsers(adminClient: ReturnType<typeof createClient>, prefix: string) {
  const matches: AuthUser[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: AUTH_PAGE_SIZE,
    });

    if (error) {
      throw new Error(`Unable to list auth users: ${error.message}`);
    }

    const users = Array.isArray(data?.users) ? data.users as AuthUser[] : [];
    matches.push(
      ...users.filter((user) =>
        typeof user.email === "string" &&
        user.email.toLowerCase().startsWith(prefix)
      )
    );

    if (users.length < AUTH_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return matches;
}

async function getProfilesByIds(adminClient: ReturnType<typeof createClient>, ids: string[]) {
  if (ids.length === 0) return new Map<string, ProfileRow>();

  const { data, error } = await adminClient
    .from("profiles")
    .select("id, email, role, full_name, created_at")
    .in("id", ids);

  if (error) {
    throw new Error(`Unable to load profiles: ${error.message}`);
  }

  return new Map((data || []).map((row) => [row.id, row as ProfileRow]));
}

async function countRows(
  adminClient: ReturnType<typeof createClient>,
  table: string,
  column: string,
  ids: string[],
) {
  if (ids.length === 0) return 0;

  const { count, error } = await adminClient
    .from(table)
    .select("id", { count: "exact", head: true })
    .in(column, ids);

  if (error) {
    if (/relation .* does not exist|could not find the table|schema cache/i.test(error.message || "")) {
      return 0;
    }
    throw new Error(`Unable to count ${table}: ${error.message}`);
  }

  return Number(count || 0);
}

async function buildCandidates(adminClient: ReturnType<typeof createClient>, authUsers: AuthUser[]) {
  const ids = authUsers.map((user) => user.id);
  const profilesById = await getProfilesByIds(adminClient, ids);
  const candidates: Candidate[] = [];

  for (const user of authUsers) {
    const userIds = [user.id];
    candidates.push({
      id: user.id,
      email: String(user.email || "").toLowerCase(),
      created_at: user.created_at || null,
      profile: profilesById.get(user.id) || null,
      related_counts: {
        enrollments: await countRows(adminClient, "enrollments", "student_id", userIds),
        payments: await countRows(adminClient, "payments", "student_id", userIds),
        course_progress: await countRows(adminClient, "course_progress", "student_id", userIds),
        assignment_submissions: await countRows(adminClient, "assignment_submissions", "student_id", userIds),
        marketer_schools: await countRows(adminClient, "marketer_schools", "marketer_id", userIds),
        marketer_claims: await countRows(adminClient, "marketer_claims", "marketer_id", userIds),
        messages_sent: await countRows(adminClient, "messages", "sender_id", userIds),
        messages_received: await countRows(adminClient, "messages", "recipient_id", userIds),
        notifications: await countRows(adminClient, "notifications", "user_id", userIds),
        activity_logs: await countRows(adminClient, "activity_logs", "user_id", userIds),
        certificates: await countRows(adminClient, "certificates", "student_id", userIds),
        audit_logs: await countRows(adminClient, "audit_logs", "user_id", userIds),
      },
    });
  }

  return candidates;
}

async function deleteRows(adminClient: ReturnType<typeof createClient>, table: string, column: string, ids: string[]) {
  if (ids.length === 0) return 0;

  const { data, error } = await adminClient
    .from(table)
    .delete()
    .in(column, ids)
    .select("id");

  if (error) {
    if (/relation .* does not exist|could not find the table|schema cache/i.test(error.message || "")) {
      return 0;
    }
    throw new Error(`Unable to delete from ${table}: ${error.message}`);
  }

  return Array.isArray(data) ? data.length : 0;
}

async function deleteQaUsers(adminClient: ReturnType<typeof createClient>, authUsers: AuthUser[]) {
  const ids = authUsers.map((user) => user.id);
  const results: Record<string, number> = {};

  // Delete child rows that may block auth.users/profile cascade in mixed schemas.
  results.marketer_claims = await deleteRows(adminClient, "marketer_claims", "marketer_id", ids);
  results.marketer_schools = await deleteRows(adminClient, "marketer_schools", "marketer_id", ids);
  results.assignment_submissions = await deleteRows(adminClient, "assignment_submissions", "student_id", ids);
  results.course_progress = await deleteRows(adminClient, "course_progress", "student_id", ids);
  results.payments = await deleteRows(adminClient, "payments", "student_id", ids);
  results.enrollments = await deleteRows(adminClient, "enrollments", "student_id", ids);
  results.certificates = await deleteRows(adminClient, "certificates", "student_id", ids);
  results.notifications = await deleteRows(adminClient, "notifications", "user_id", ids);
  results.activity_logs = await deleteRows(adminClient, "activity_logs", "user_id", ids);
  results.audit_logs = await deleteRows(adminClient, "audit_logs", "user_id", ids);
  results.messages_sent = await deleteRows(adminClient, "messages", "sender_id", ids);
  results.messages_received = await deleteRows(adminClient, "messages", "recipient_id", ids);

  let deletedAuthUsers = 0;
  const authErrors: Array<{ email: string; error: string }> = [];

  for (const user of authUsers) {
    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) {
      authErrors.push({
        email: String(user.email || ""),
        error: error.message,
      });
      continue;
    }
    deletedAuthUsers += 1;
  }

  results.auth_users = deletedAuthUsers;

  return {
    results,
    authErrors,
  };
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return jsonResponse(500, { error: "Supabase environment variables not set" });
    }

    const authHeader =
      req.headers.get("Authorization") ||
      req.headers.get("authorization") ||
      "";
    if (!authHeader) return jsonResponse(401, { error: "Missing Authorization" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    await assertActiveAdmin(userClient, adminClient);

    const body = await req.json().catch(() => ({}));
    const prefix = normalizePrefix(body?.prefix);
    const dryRun = body?.dry_run !== false;

    const authUsers = await listQaAuthUsers(adminClient, prefix);
    const candidates = await buildCandidates(adminClient, authUsers);

    if (dryRun) {
      return jsonResponse(200, {
        ok: true,
        dry_run: true,
        prefix,
        matched_users: candidates.length,
        candidates,
      });
    }

    const deletion = await deleteQaUsers(adminClient, authUsers);

    return jsonResponse(200, {
      ok: true,
      dry_run: false,
      prefix,
      matched_users: candidates.length,
      deleted: deletion.results,
      auth_errors: deletion.authErrors,
      candidates,
    });
  } catch (err) {
    console.error("admin-qa-user-cleanup error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const status =
      /Unauthorized|Missing Authorization/i.test(message) ? 401 :
      /Forbidden/i.test(message) ? 403 :
      500;

    return jsonResponse(status, {
      error: status === 500 ? "Internal error" : message,
      detail: message,
    });
  }
});
