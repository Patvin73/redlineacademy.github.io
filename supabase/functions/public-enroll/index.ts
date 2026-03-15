import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(status: number, body: Record<string, unknown>) {
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

function safeString(value: unknown) {
  return String(value || "").trim();
}

function normalizeSlug(value: string) {
  return value.replace(/\s+/g, "-").replace(/_/g, "-").toLowerCase();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

const programTitleHints: Record<string, string[]> = {
  assistant_carer: ["assistant carer", "asisten perawat", "care giver", "caregiver"],
  care_giver: ["care giver", "caregiver", "asisten perawat", "assistant carer"]
};

const programTitleMap: Record<string, string> = {
  assistant_carer: "Asisten Perawat",
  care_giver: "Care Giver"
};

function programLabel(value: string) {
  return programTitleMap[value] || value.replace(/[_-]+/g, " ").trim();
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

    const adminClient = createClient(supabaseUrl, serviceKey);

    let payload: Record<string, unknown> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await req.json().catch(() => ({}));
    } else {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        payload[key] = value;
      }
    }

    const fullName = safeString(payload.fullname || payload.full_name);
    const email = safeString(payload.email).toLowerCase();
    const phone = safeString(payload.phone);
    const dobRaw = safeString(payload.dob || payload.date_of_birth);
    const gender = safeString(payload.gender);
    const address = safeString(payload.address);
    const city = safeString(payload.city);
    const postcode = safeString(payload.postcode);

    const selectedProgram = safeString(payload.selected_program || payload.program || payload.course);
    const paymentPlan = safeString(payload.payment_plan || "full");
    const paymentMethod = safeString(payload.payment_method);
    const invoiceName = safeString(payload.invoice_name);
    const invoiceEmail = safeString(payload.invoice_email).toLowerCase();
    const promoCode = safeString(payload.promo_code);

    const paymentCurrency = safeString(payload.payment_currency || "IDR");
    const paymentTotal = Number(payload.payment_total || 0) || 0;
    const programFee = Number(payload.program_fee || 0) || 0;
    const planDiscount = Number(payload.plan_discount || 0) || 0;
    const promoDiscount = Number(payload.promo_discount || 0) || 0;
    const paymentReference = safeString(payload.payment_reference);

    if (!fullName || !email || !isValidEmail(email)) {
      return jsonResponse(400, { error: "Valid full name and email are required" });
    }
    if (!phone) {
      return jsonResponse(400, { error: "Phone number is required" });
    }
    if (!selectedProgram) {
      return jsonResponse(400, { error: "Program selection is required" });
    }
    if (!paymentMethod) {
      return jsonResponse(400, { error: "Payment method is required" });
    }
    if (!invoiceName || !invoiceEmail || !isValidEmail(invoiceEmail)) {
      return jsonResponse(400, { error: "Valid invoice name and email are required" });
    }
    if (paymentTotal <= 0) {
      return jsonResponse(400, { error: "Payment total is invalid" });
    }

    let course = null;
    let courseErr = null;

    if (isUuid(selectedProgram)) {
      const { data, error } = await adminClient
        .from("courses")
        .select("id, title, slug, status")
        .eq("id", selectedProgram)
        .maybeSingle();
      course = data;
      courseErr = error;
    } else {
      const normalizedSlug = normalizeSlug(selectedProgram);
      const slugAlt = normalizedSlug.replace(/-/g, "_");

      const { data, error } = await adminClient
        .from("courses")
        .select("id, title, slug, status")
        .or(`slug.eq.${normalizedSlug},slug.eq.${slugAlt}`)
        .maybeSingle();
      course = data;
      courseErr = error;

      if (!course?.id) {
        const { data: slugMatch } = await adminClient
          .from("courses")
          .select("id, title, slug, status")
          .ilike("slug", `%${normalizedSlug}%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        course = slugMatch || course;
      }

      if (!course?.id) {
        const baseTitle = selectedProgram.replace(/[_-]+/g, " ").trim();
        const hints = programTitleHints[selectedProgram] || [];
        const titleCandidates = [baseTitle, ...hints].filter(Boolean);

        for (const candidate of titleCandidates) {
          const { data: titleMatch } = await adminClient
            .from("courses")
            .select("id, title, slug, status")
            .ilike("title", `%${candidate}%`)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (titleMatch?.id) {
            course = titleMatch;
            break;
          }
        }
      }
    }

    if (courseErr) {
      return jsonResponse(500, { error: courseErr.message || "Failed to load course" });
    }
    if (!course?.id) {
      const title = programLabel(selectedProgram);
      const desiredSlug = normalizeSlug(selectedProgram || title);
      let ownerId: string | null = null;

      const { data: trainer } = await adminClient
        .from("profiles")
        .select("id")
        .eq("role", "trainer")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      ownerId = trainer?.id || null;

      if (!ownerId) {
        const { data: admin } = await adminClient
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .eq("is_active", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        ownerId = admin?.id || null;
      }

      if (!ownerId) {
        return jsonResponse(400, { error: "No trainer/admin available to attach program" });
      }

      const { data: createdCourse, error: createCourseErr } = await adminClient
        .from("courses")
        .insert({
          trainer_id: ownerId,
          title,
          slug: desiredSlug,
          description: "",
          enrollment_type: "paid",
          price: programFee || paymentTotal,
          status: "published"
        })
        .select("id, title, slug, status")
        .single();

      if (createCourseErr) {
        const { data: fallbackCourse } = await adminClient
          .from("courses")
          .select("id, title, slug, status")
          .eq("slug", desiredSlug)
          .maybeSingle();
        course = fallbackCourse || null;
      } else {
        course = createdCourse;
      }
    }

    if (!course?.id) {
      return jsonResponse(400, { error: "Selected program not found in courses" });
    }
    if (course.status && course.status !== "published") {
      return jsonResponse(400, { error: "Selected program is not available" });
    }

    let userId: string | null = null;
    let createdPassword: string | null = null;

    const { data: existingProfile, error: profileLookupErr } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profileLookupErr) {
      return jsonResponse(500, { error: profileLookupErr.message || "Profile lookup failed" });
    }

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      createdPassword = generatePassword(12);
      const { data: createdUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password: createdPassword,
        email_confirm: false,
        user_metadata: { full_name: fullName, role: "student" }
      });
      if (createErr) {
        const msg = createErr.message || "Create user failed";
        if (msg.toLowerCase().includes("already")) {
          const { data: retryProfile } = await adminClient
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();
          if (retryProfile?.id) {
            userId = retryProfile.id;
          } else {
            return jsonResponse(400, { error: msg });
          }
        } else {
          return jsonResponse(400, { error: msg });
        }
      } else {
        userId = createdUser?.user?.id || null;
      }
    }

    if (!userId) {
      return jsonResponse(500, { error: "Failed to resolve user" });
    }

    let idDocumentPath: string | null = null;
    const idDocument = payload.id_document;
    if (idDocument && idDocument instanceof File && idDocument.size > 0) {
      const safeName = idDocument.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      idDocumentPath = `${userId}/${Date.now()}-${safeName}`;
      const { error: uploadErr } = await adminClient
        .storage
        .from("enrollment-docs")
        .upload(idDocumentPath, idDocument, { contentType: idDocument.type });
      if (uploadErr) {
        console.warn("id_document upload error:", uploadErr.message);
        idDocumentPath = null;
      }
    }

    const profilePayload: Record<string, unknown> = {
      id: userId,
      full_name: fullName,
      email,
      phone,
      role: "student",
      is_active: false,
      address: address || null,
      city: city || null,
      postcode: postcode || null
    };

    if (dobRaw) profilePayload.date_of_birth = dobRaw;
    if (idDocumentPath) profilePayload.id_document_path = idDocumentPath;

    const { error: profileErr } = await adminClient
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });
    if (profileErr) {
      console.warn("profiles upsert error:", profileErr.message);
    }

    const paymentStatus = "pending";
    const planValue = paymentPlan === "installment" ? "installment" : "full";
    const installmentTotal = planValue === "installment" ? 2 : 1;
    const installmentPaid = 0;

    const { data: existingPayment, error: paymentFindErr } = await adminClient
      .from("payments")
      .select("id")
      .eq("student_id", userId)
      .eq("course_id", course.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentFindErr) {
      return jsonResponse(500, { error: paymentFindErr.message || "Failed to check payment" });
    }

    if (existingPayment?.id) {
      const { error: paymentUpdErr } = await adminClient
        .from("payments")
        .update({
          amount: paymentTotal,
          currency: paymentCurrency || "IDR",
          payment_method: paymentMethod,
          status: paymentStatus,
          paid_at: null,
          payment_plan: planValue,
          installment_total: installmentTotal,
          installment_paid: installmentPaid,
          next_due_at: null
        })
        .eq("id", existingPayment.id);
      if (paymentUpdErr) {
        return jsonResponse(500, { error: paymentUpdErr.message || "Failed to update payment" });
      }
    } else {
      const { error: paymentErr } = await adminClient
        .from("payments")
        .insert({
          student_id: userId,
          course_id: course.id,
          amount: paymentTotal,
          currency: paymentCurrency || "IDR",
          payment_method: paymentMethod,
          status: paymentStatus,
          paid_at: null,
          payment_plan: planValue,
          installment_total: installmentTotal,
          installment_paid: installmentPaid,
          next_due_at: null
        });

      if (paymentErr) {
        return jsonResponse(500, { error: paymentErr.message || "Failed to create payment" });
      }
    }

    return jsonResponse(200, {
      ok: true,
      user_id: userId,
      course_id: course.id,
      payment_reference: paymentReference || null,
      created_password: createdPassword ? true : false,
      note: "Registration captured"
    });
  } catch (err) {
    console.error("public-enroll error:", err);
    return jsonResponse(500, { error: "Internal error", detail: err?.message || String(err) });
  }
});
