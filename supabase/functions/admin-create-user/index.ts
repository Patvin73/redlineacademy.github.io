import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
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
      global: { headers: { Authorization: authHeader } }
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
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.full_name || "").trim();
    const role = String(body.role || "student").trim().toLowerCase();
    const password = String(body.password || "").trim();

    const allowedRoles = ["student", "trainer", "admin"];
    if (!email || !fullName || !isValidEmail(email)) {
      return jsonResponse(400, { error: "Valid email and full name are required" });
    }
    if (!allowedRoles.includes(role)) {
      return jsonResponse(400, { error: "Invalid role" });
    }

    const finalPassword = password || generatePassword(12);

    const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role }
    });

    if (createErr) {
      const msg = createErr.message || "Create user failed";
      const status = msg.toLowerCase().includes("already") ? 409 : 400;
      return jsonResponse(status, { error: msg });
    }

    const userId = createData?.user?.id;
    if (userId) {
      const { error: upsertErr } = await adminClient
        .from("profiles")
        .upsert({ id: userId, full_name: fullName, email, role, is_active: true }, { onConflict: "id" });
      if (upsertErr) {
        console.warn("profiles upsert error:", upsertErr.message);
      }
    }

    return jsonResponse(200, { ok: true, user_id: userId, temp_password: password ? null : finalPassword });
  } catch (err) {
    console.error("admin-create-user error:", err);
    return jsonResponse(500, { error: "Internal error", detail: err?.message || String(err) });
  }
});
