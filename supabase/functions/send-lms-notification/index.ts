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
const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN") || "";
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";
const whatsappApiUrl = Deno.env.get("WHATSAPP_API_URL") || "";
const whatsappDefaultCountry = Deno.env.get("WHATSAPP_DEFAULT_COUNTRY_CODE") || "62";

const adminClient = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  : null;

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
};

type DeliveryItem = {
  id: string;
  kind: "message" | "notification";
  recipientId: string;
  senderId?: string | null;
  title: string;
  body: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function escapeHtml(value: unknown) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function displayName(profile?: Profile | null, fallback = "there") {
  return profile?.full_name || profile?.email || fallback;
}

function uniqLimitedIds(value: unknown, limit = 25) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, limit);
}

function normalizeWhatsAppNumber(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `${whatsappDefaultCountry}${digits.slice(1)}`;
  return /^\d{8,15}$/.test(digits) ? digits : "";
}

async function getProfiles(ids: string[]) {
  if (!ids.length) return new Map<string, Profile>();
  const { data, error } = await adminClient!
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active")
    .in("id", ids)
    .eq("is_active", true);
  if (error) throw error;
  return new Map((data || []).map((profile: Profile) => [profile.id, profile]));
}

async function sendResendEmail({ to, subject, html, text, replyTo }: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  if (!resendApiKey) return { sent: false, reason: "RESEND_API_KEY is not configured" };
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
  const body = await res.json().catch(() => ({})) as Record<string, any>;
  if (!res.ok) throw new Error(body?.message || `Email provider failed (${res.status})`);
  return { sent: true, provider_id: body?.id || null };
}

async function sendWhatsAppMessage({ to, text }: { to: string; text: string }) {
  if (!to) return { sent: false, reason: "Recipient has no valid WhatsApp number" };
  if (!whatsappAccessToken) return { sent: false, reason: "WHATSAPP_ACCESS_TOKEN is not configured" };

  const url = whatsappApiUrl || (
    whatsappPhoneNumberId
      ? `https://graph.facebook.com/v20.0/${whatsappPhoneNumberId}/messages`
      : ""
  );
  if (!url) return { sent: false, reason: "WhatsApp endpoint is not configured" };

  const payload = whatsappApiUrl
    ? { to, text }
    : {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: text }
    };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${whatsappAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const body = await res.json().catch(() => ({})) as Record<string, any>;
  if (!res.ok) throw new Error(body?.error?.message || body?.message || `WhatsApp provider failed (${res.status})`);
  return { sent: true, provider_id: body?.messages?.[0]?.id || body?.id || null };
}

function buildMessageText(item: DeliveryItem, recipient: Profile, sender?: Profile | null) {
  const senderName = displayName(sender, "Redline Academy");
  const recipientName = displayName(recipient);
  if (item.kind === "message") {
    return [
      `Hi ${recipientName},`,
      "",
      `You received a new Redline Academy message from ${senderName}.`,
      "",
      item.body,
      "",
      "Please sign in to your dashboard to reply."
    ].join("\n");
  }
  return [
    `Hi ${recipientName},`,
    "",
    item.title,
    item.body ? `\n${item.body}` : "",
    "",
    "Please sign in to your Redline Academy dashboard for details."
  ].filter(Boolean).join("\n");
}

function buildEmailHtml(text: string) {
  const [greeting, , ...rest] = text.split("\n");
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <p>${escapeHtml(greeting)}</p>
      <div style="padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">
        ${textToHtml(rest.join("\n").trim())}
      </div>
    </div>`;
}

async function loadDeliveryItems(messageIds: string[], notificationIds: string[]) {
  const items: DeliveryItem[] = [];

  if (messageIds.length) {
    const { data, error } = await adminClient!
      .from("messages")
      .select("id, sender_id, recipient_id, subject, body")
      .in("id", messageIds);
    if (error) throw error;
    (data || []).forEach((message) => {
      items.push({
        id: message.id,
        kind: "message",
        recipientId: message.recipient_id,
        senderId: message.sender_id,
        title: message.subject || "New Redline Academy message",
        body: message.body || ""
      });
    });
  }

  if (notificationIds.length) {
    const { data, error } = await adminClient!
      .from("notifications")
      .select("id, user_id, type, title, body")
      .in("id", notificationIds);
    if (error) throw error;
    (data || []).forEach((notification) => {
      items.push({
        id: notification.id,
        kind: "notification",
        recipientId: notification.user_id,
        title: notification.title || "Redline Academy notification",
        body: notification.body || ""
      });
    });
  }

  return items;
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed" });
    if (!supabaseUrl || !anonKey || !adminClient) {
      return jsonResponse(500, { error: "Supabase environment variables not set" });
    }

    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization") || "";
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
    const messageIds = uniqLimitedIds(body.message_ids ?? body.message_id);
    const notificationIds = uniqLimitedIds(body.notification_ids ?? body.notification_id);
    if (!messageIds.length && !notificationIds.length) {
      return jsonResponse(400, { error: "message_ids or notification_ids is required" });
    }

    const items = await loadDeliveryItems(messageIds, notificationIds);
    const profileIds = [...new Set(items.flatMap((item) => [item.recipientId, item.senderId]).filter(Boolean) as string[])];
    const profiles = await getProfiles(profileIds);
    const caller = (await getProfiles([userData.user.id])).get(userData.user.id);
    const callerIsStaff = caller && ["admin", "trainer"].includes(caller.role || "");

    const results = [];
    for (const item of items) {
      const recipient = profiles.get(item.recipientId);
      const sender = item.senderId ? profiles.get(item.senderId) : null;
      if (!recipient) {
        results.push({ id: item.id, skipped: true, reason: "Recipient profile not active or not found" });
        continue;
      }

      if (item.kind === "message" && userData.user.id !== item.senderId && !callerIsStaff) {
        results.push({ id: item.id, skipped: true, reason: "Forbidden" });
        continue;
      }

      const text = buildMessageText(item, recipient, sender);
      const subject = String(item.title || "Redline Academy notification").slice(0, 180);
      const emailTo = emailRegex.test(recipient.email || "") ? recipient.email! : "";
      const replyTo = emailRegex.test(sender?.email || "") ? sender!.email! : emailReplyTo;
      const whatsappTo = normalizeWhatsAppNumber(recipient.phone);
      const itemResult: Record<string, unknown> = { id: item.id, kind: item.kind };

      if (emailTo) {
        try {
          itemResult.email = await sendResendEmail({
            to: emailTo,
            subject,
            text,
            html: buildEmailHtml(text),
            replyTo
          });
        } catch (err) {
          itemResult.email = { sent: false, error: errorMessage(err) };
        }
      } else {
        itemResult.email = { sent: false, reason: "Recipient has no valid email" };
      }

      try {
        itemResult.whatsapp = await sendWhatsAppMessage({ to: whatsappTo, text });
      } catch (err) {
        itemResult.whatsapp = { sent: false, error: errorMessage(err) };
      }

      results.push(itemResult);
    }

    return jsonResponse(200, {
      ok: true,
      processed: results.length,
      results
    });
  } catch (err) {
    console.error("send-lms-notification error:", err);
    return jsonResponse(500, { error: "Internal error", detail: errorMessage(err) });
  }
});
