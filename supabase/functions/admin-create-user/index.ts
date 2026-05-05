import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const passwordChars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedRoles = new Set(["student", "trainer", "admin"]);

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");
const adminClient = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  : null;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders
  });
}

function generatePassword(length = 12) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  const chars = new Array(length);
  for (let i = 0; i < length; i += 1) {
    chars[i] = passwordChars[values[i] % passwordChars.length];
  }
  return chars.join("");
}

function isValidEmail(email) {
  return emailRegex.test(email || "");
}

function isAlreadyRegisteredError(error) {
  return String(error?.message || "")
    .toLowerCase()
    .includes("already");
}

async function findAuthUserByEmail(adminClient, email) {
  const perPage = 1000;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage
    });

    if (error) {
      throw error;
    }

    const users = Array.isArray(data?.users) ? data.users : [];
    const found = users.find(
      (user) => String(user.email || "").toLowerCase() === email
    );

    if (found) {
      return found;
    }

    if (users.length < perPage) {
      return null;
    }
  }

  return null;
}

async function findProfileUserIdByEmail(adminClient, email) {
  const { data, error } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (error) {
    throw error;
  }

  return Array.isArray(data) && data[0]?.id ? data[0].id : null;
}

async function resolveExistingUserIdByEmail(adminClient, email) {
  const profileUserId = await findProfileUserIdByEmail(adminClient, email);
  if (profileUserId) {
    return profileUserId;
  }

  const user = await findAuthUserByEmail(adminClient, email);
  return user?.id || null;
}

async function ensureProfile(adminClient, { id, fullName, email, role }) {
  const { error: upsertErr } = await adminClient
    .from("profiles")
    .upsert(
      { id, full_name: fullName, email, role, is_active: true },
      { onConflict: "id" }
    );

  if (upsertErr) {
    throw upsertErr;
  }
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });

    if (!supabaseUrl || !anonKey || !adminClient) {
      return jsonResponse(500, { error: "Supabase environment variables not set" });
    }

    const authHeader =
      req.headers.get("Authorization") ||
      req.headers.get("authorization") ||
      "";
    if (!authHeader) return jsonResponse(401, { error: "Missing Authorization" });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
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

    if (!email || !fullName || !isValidEmail(email)) {
      return jsonResponse(400, { error: "Valid email and full name are required" });
    }
    if (!allowedRoles.has(role)) {
      return jsonResponse(400, { error: "Invalid role" });
    }

    const finalPassword = password || generatePassword(12);

    let existingUser = false;
    let userId = null;
    const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: finalPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName, role }
    });

    if (createErr) {
      if (!isAlreadyRegisteredError(createErr)) {
        return jsonResponse(400, { error: createErr.message || "Create user failed" });
      }

      userId = await resolveExistingUserIdByEmail(adminClient, email);
      if (!userId) {
        return jsonResponse(409, {
          error: createErr.message || "User already exists",
          detail: "Existing auth user could not be resolved by email"
        });
      }

      existingUser = true;
    } else {
      userId = createData?.user?.id || null;
    }

    if (!userId) {
      return jsonResponse(500, { error: "Auth user was created without an id" });
    }

    try {
      await ensureProfile(adminClient, { id: userId, fullName, email, role });
    } catch (profileErr) {
      let cleanupError = null;
      if (!existingUser) {
        const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId);
        cleanupError = deleteErr?.message || null;
      }

      return jsonResponse(500, {
        error: "Profile provisioning failed",
        detail: profileErr?.message || String(profileErr),
        cleanup_error: cleanupError
      });
    }

    if (existingUser) {
      return jsonResponse(409, {
        error: "User already exists",
        user_id: userId,
        profile_verified: true
      });
    }

    return jsonResponse(200, { ok: true, user_id: userId, temp_password: password ? null : finalPassword });
  } catch (err) {
    console.error("admin-create-user error:", err);
    return jsonResponse(500, { error: "Internal error", detail: err?.message || String(err) });
  }
});
