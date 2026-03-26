import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedTables = new Set([
  "payments",
  "enrollments",
  "course_progress",
  "assignment_submissions",
  "assignments",
  "courses",
  "marketer_claims",
  "marketer_schools",
]);

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return jsonResponse(401, { error: userErr?.message || "Unauthorized" });
    }

    const { data: adminProfile, error: adminErr } = await adminClient
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (adminErr) {
      return jsonResponse(403, { error: adminErr.message || "Forbidden" });
    }
    if (!adminProfile || adminProfile.role !== "admin" || adminProfile.is_active === false) {
      return jsonResponse(403, { error: "Forbidden" });
    }

    const body = await req.json().catch(() => ({}));
    const entries = Array.isArray(body?.entries) ? body.entries : [];

    if (entries.length === 0) {
      return jsonResponse(400, { error: "Cleanup entries are required" });
    }

    const results = [];

    for (const entry of entries) {
      if (!isObject(entry)) {
        return jsonResponse(400, { error: "Each cleanup entry must be an object" });
      }

      const table = String(entry.table || "").trim();
      const filters = isObject(entry.filters) ? entry.filters : null;

      if (!allowedTables.has(table)) {
        return jsonResponse(400, { error: `Cleanup table not allowed: ${table}` });
      }
      if (!filters || Object.keys(filters).length === 0) {
        return jsonResponse(400, { error: `Filters are required for cleanup table: ${table}` });
      }

      let query = adminClient.from(table).delete().select("id");
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }

      const { data, error } = await query;
      if (error) {
        return jsonResponse(400, {
          error: `Cleanup failed for ${table}`,
          detail: error.message,
          table,
          filters,
        });
      }

      results.push({
        table,
        filters,
        deleted: Array.isArray(data) ? data.length : 0,
      });
    }

    return jsonResponse(200, { ok: true, results });
  } catch (err) {
    console.error("admin-live-cleanup error:", err);
    return jsonResponse(500, {
      error: "Internal error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});
