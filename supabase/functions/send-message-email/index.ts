import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const emailFrom = Deno.env.get("LMS_EMAIL_FROM") || "Redline Academy <no-reply@redlineacademy.com.au>";
const emailReplyTo = Deno.env.get("LMS_EMAIL_REPLY_TO") || "";

const adminClient = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  : null;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function displayName(profile, fallback) {
  return profile?.full_name || profile?.email || fallback;
}

async function getProfile(id) {
  const { data, error } = await adminClient
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function sendResendEmail({ to, replyTo, subject, html, text }) {
  if (!resendApiKey) {
    return { sent: false, reason: "RESEND_API_KEY is not configured" };
  }

  const payload: Record<string, unknown> = {
    from: emailFrom,
    to: [to],
    subject,
    html,
    text
  };
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || `Email provider failed (${res.status})`);
  }

  return { sent: true, provider_id: body?.id || null };
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

    const body = await req.json().catch(() => ({}));
    const messageId = String(body.message_id || "").trim();
    if (!messageId) return jsonResponse(400, { error: "message_id is required" });

    const { data: message, error: messageErr } = await adminClient
      .from("messages")
      .select("id, sender_id, recipient_id, subject, body, created_at")
      .eq("id", messageId)
      .maybeSingle();
    if (messageErr) throw messageErr;
    if (!message) return jsonResponse(404, { error: "Message not found" });

    const sender = await getProfile(message.sender_id);
    const recipient = await getProfile(message.recipient_id);
    const caller = await getProfile(userData.user.id);

    const callerIsSender = userData.user.id === message.sender_id;
    const callerIsStaff = caller && ["admin", "trainer"].includes(caller.role);
    if (!callerIsSender && !callerIsStaff) {
      return jsonResponse(403, { error: "Forbidden" });
    }

    if (!recipient?.email || !emailRegex.test(recipient.email)) {
      return jsonResponse(422, { error: "Recipient has no valid email" });
    }

    const senderName = displayName(sender, "Redline Academy");
    const recipientName = displayName(recipient, "there");
    const emailSubject = message.subject || `New message from ${senderName}`;
    const safeSubject = String(emailSubject).slice(0, 180);
    const replyTo = emailRegex.test(sender?.email || "") ? sender.email : emailReplyTo;
    const text = [
      `Hi ${recipientName},`,
      "",
      `You received a new Redline Academy message from ${senderName}.`,
      "",
      message.body || "",
      "",
      "Please sign in to your dashboard to reply."
    ].join("\n");
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <p>Hi ${escapeHtml(recipientName)},</p>
        <p>You received a new Redline Academy message from <strong>${escapeHtml(senderName)}</strong>.</p>
        <div style="padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">
          ${textToHtml(message.body || "")}
        </div>
        <p>Please sign in to your dashboard to reply.</p>
      </div>`;

    const result = await sendResendEmail({
      to: recipient.email,
      replyTo,
      subject: safeSubject,
      html,
      text
    });

    return jsonResponse(result.sent ? 200 : 202, {
      ok: true,
      email_sent: result.sent,
      provider_id: result.provider_id || null,
      reason: result.reason || null
    });
  } catch (err) {
    console.error("send-message-email error:", err);
    return jsonResponse(500, { error: "Internal error", detail: err?.message || String(err) });
  }
});
