const { test, expect } = require("@playwright/test");

function buildSupabaseStub({ tableData, currentUser }) {
  return `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const currentUser = ${JSON.stringify(currentUser)};
      const uploadedFiles = [];
      const shouldFailAvatarProfileUpdate = Boolean(tableData.__failProfileAvatarUpdate);

      window.__QA_UPLOADED_FILES__ = uploadedFiles;
      window.__QA_TABLE_DATA__ = tableData;

      const getValue = (obj, path) => {
        if (!obj) return undefined;
        return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
      };

      const makeResponse = (rows) => ({
        data: rows,
        error: null,
        count: Array.isArray(rows) ? rows.length : 0
      });

      const toComparable = (value) => {
        if (!value) return value;
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) return date.getTime();
        return value;
      };

      const createQuery = (table) => {
        const baseRows = Array.isArray(tableData[table]) ? tableData[table] : [];
        let rows = baseRows.slice();
        let limitValue = null;
        let queryError = null;
        let pendingUpdatePayload = null;

        const api = {
          select: (expression = "") => {
            if (table === "assignments" && String(expression).includes("assignment_submissions")) {
              rows = rows.map((row) => ({
                ...row,
                assignment_submissions: (tableData.assignment_submissions || [])
                  .filter((submission) => submission.assignment_id === row.id)
              }));
            }
            return api;
          },
          eq: (col, val) => {
            rows = rows.filter((row) => {
              if (col.startsWith("assignment_submissions.") && Array.isArray(row.assignment_submissions)) {
                const nestedCol = col.slice("assignment_submissions.".length);
                row.assignment_submissions = row.assignment_submissions
                  .filter((submission) => getValue(submission, nestedCol) === val);
                return true;
              }
              const value = getValue(row, col);
              if (typeof value === "undefined") return true;
              return value === val;
            });
            return api;
          },
          in: (col, vals) => {
            rows = rows.filter((row) => {
              const value = getValue(row, col);
              if (typeof value === "undefined") return true;
              return vals.includes(value);
            });
            return api;
          },
          or: () => api,
          order: () => api,
          lt: (col, val) => {
            const target = toComparable(val);
            rows = rows.filter((row) => {
              const value = toComparable(getValue(row, col));
              if (typeof value === "undefined") return true;
              return value < target;
            });
            return api;
          },
          gte: (col, val) => {
            const target = toComparable(val);
            rows = rows.filter((row) => {
              const value = toComparable(getValue(row, col));
              if (typeof value === "undefined") return true;
              return value >= target;
            });
            return api;
          },
          limit: (n) => {
            limitValue = n;
            return api;
          },
          single: () => Promise.resolve({ data: rows[0] || null, error: null }),
          maybeSingle: () => Promise.resolve({ data: rows[0] || null, error: null }),
          insert: (payload) => {
            const items = Array.isArray(payload) ? payload : [payload];
            items.forEach((item) => {
              if (!item.id) {
                item.id = table + "-e2e-" + Math.random().toString(36).slice(2, 8);
              }
              baseRows.push(item);
            });
            return api;
          },
          update: (payload) => {
            if (
              table === "profiles" &&
              payload &&
              Object.prototype.hasOwnProperty.call(payload, "avatar_url") &&
              shouldFailAvatarProfileUpdate
            ) {
              queryError = { message: "Avatar profile update failed" };
              return api;
            }
            pendingUpdatePayload = payload;
            return api;
          },
          delete: () => {
            rows.forEach((row) => {
              const idx = baseRows.indexOf(row);
              if (idx >= 0) baseRows.splice(idx, 1);
            });
            return api;
          }
        };

        api.then = (resolve) => {
          if (pendingUpdatePayload && !queryError) {
            rows.forEach((row) => Object.assign(row, pendingUpdatePayload));
            pendingUpdatePayload = null;
          }
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          return resolve(queryError ? { data: null, error: queryError, count: 0 } : makeResponse(data));
        };
        api.catch = (reject) => Promise.resolve(queryError ? { data: null, error: queryError, count: 0 } : makeResponse(rows)).catch(reject);
        return api;
      };

      window.supabase = {
        createClient: () => ({
          auth: {
            getSession: async () => ({
              data: { session: { user: currentUser } },
              error: null
            }),
            getUser: async () => ({
              data: { user: currentUser },
              error: null
            }),
            signOut: async () => ({ error: null })
          },
          from: (table) => createQuery(table),
          channel: () => ({
            on: () => ({ subscribe: () => ({}) })
          }),
          storage: {
            from: (bucket) => ({
              upload: async (path, file, options) => {
                uploadedFiles.push({ bucket, path, name: file.name, type: file.type, size: file.size, options });
                return { data: { path }, error: null };
              },
              getPublicUrl: (path) => ({ data: { publicUrl: "https://example.com/" + bucket + "/" + path } })
            })
          }
        })
      };
    })();
  `;
}

async function installSupabaseStub(page, { tableData, currentUser }) {
  const stub = buildSupabaseStub({ tableData, currentUser });
  await page.route("**/*supabase-js@2*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript; charset=utf-8",
      body: stub
    });
  });
}

function collectConsoleErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (shouldIgnoreConsoleError(text)) return;
    errors.push(text);
  });
  return errors;
}

function shouldIgnoreConsoleError(text) {
  const msg = text || "";
  return (
    msg.includes("ERR_INTERNET_DISCONNECTED") ||
    msg.includes("fonts.googleapis.com") ||
    msg.includes("cdn.jsdelivr.net") ||
    msg.includes("Failed to load resource")
  );
}

function makeStudentStub(role = "student") {
  const profiles = [
    {
      id: "student-1",
      full_name: "Alpha Student",
      role: "student",
      student_id: "ST-001",
      email: "alpha@example.com",
      created_at: "2026-03-02T08:00:00.000Z"
    },
    {
      id: "admin-1",
      full_name: "Admin User",
      role: "admin",
      admin_id: "ADM-001",
      email: "admin@example.com",
      created_at: "2026-03-01T08:00:00.000Z"
    }
  ];

  const currentProfile = profiles.find((p) => p.role === role) || profiles[0];

  const courses = [
    {
      id: "course-1",
      title: "Caregiver Basics",
      thumbnail_url: "",
      category: "Caregiving",
      trainer_name: "Trainer One"
    },
    {
      id: "course-2",
      title: "Clinical Skills",
      thumbnail_url: "",
      category: "Healthcare",
      trainer_name: "Trainer Two"
    }
  ];

  const enrollments = [
    {
      id: "enroll-1",
      student_id: "student-1",
      course_id: "course-1",
      status: "active",
      progress_percent: 65
    },
    {
      id: "enroll-2",
      student_id: "student-1",
      course_id: "course-2",
      status: "completed",
      progress_percent: 100
    }
  ];

  const assignments = [
    {
      id: "assign-1",
      course_id: "course-1",
      title: "Module 1 Quiz",
      type: "quiz",
      course_title: "Caregiver Basics",
      due_at: "2026-03-20"
    },
    {
      id: "assign-2",
      course_id: "course-2",
      title: "Final Assignment",
      type: "assignment",
      course_title: "Clinical Skills",
      due_at: "2026-03-25"
    }
  ];

  const assignmentSubmissions = [
    {
      id: "sub-1",
      assignment_id: "assign-2",
      student_id: "student-1",
      status: "graded",
      submitted_at: "2026-03-10T08:00:00.000Z"
    }
  ];

  const tableData = {
    profiles,
    v_student_dashboard: [
      {
        student_id: "student-1",
        courses_enrolled: 2,
        lessons_completed: 8,
        pending_submissions: 1,
        certificates_earned: 0
      }
    ],
    course_progress: [
      {
        student_id: "student-1",
        completion_percent: 65,
        last_accessed_at: "2026-03-12T08:00:00.000Z",
        last_lesson_id: "lesson-1",
        courses: { id: "course-1", title: "Caregiver Basics", thumbnail_url: "", slug: "caregiver-basics" },
        enrollments: { status: "active" }
      }
    ],
    enrollments,
    courses,
    assignments,
    assignment_submissions: assignmentSubmissions,
    schedules: [
      {
        id: "sched-1",
        course_id: "course-1",
        title: "Live Session",
        event_type: "live_session",
        start_datetime: "2099-01-01T10:00:00.000Z",
        end_datetime: "2099-01-01T11:00:00.000Z",
        meeting_url: "https://example.com/meet"
      }
    ],
    activity_logs: [],
    notifications: [],
    messages: []
  };

  return {
    currentUser: { id: currentProfile.id, email: currentProfile.email },
    tableData
  };
}

function makeMarketerStub(role = "marketer") {
  const profiles = [
    {
      id: "marketer-1",
      full_name: "Marketer One",
      role: "marketer",
      email: "marketer@example.com"
    },
    {
      id: "staff-1",
      full_name: "Staff One",
      role: "staff",
      email: "staff@example.com"
    },
    {
      id: "student-1",
      full_name: "Student One",
      role: "student",
      student_id: "ST-002",
      email: "student@example.com"
    }
  ];

  const currentProfile = profiles.find((p) => p.role === role) || profiles[0];

  const schools = [
    {
      id: "school-1",
      marketer_id: "marketer-1",
      name: "SMK Nusantara",
      city: "Bandung",
      contact_name: "Pak Arif",
      phone: "08123456789",
      notes: ""
    }
  ];

  const claims = [
    {
      id: "claim-1",
      marketer_id: "marketer-1",
      school_id: "school-1",
      ref_id: "DUP-001",
      presentation_date: "2026-03-01",
      students_present: 12,
      students_enrolled: 5,
      program_fee: 4600000,
      access_fee: 0,
      enrollment_comm: 2500000,
      bonus: 500000,
      total_commission: 3000000,
      status: "rejected",
      notes: "Incomplete docs",
      marketer_schools: { name: "SMK Nusantara", city: "Bandung" }
    },
    {
      id: "claim-2",
      marketer_id: "marketer-1",
      school_id: "school-1",
      ref_id: "DUP-001",
      presentation_date: "2026-03-05",
      students_present: 8,
      students_enrolled: 3,
      program_fee: 4600000,
      access_fee: 0,
      enrollment_comm: 1200000,
      bonus: 0,
      total_commission: 1200000,
      status: "pending",
      notes: "",
      marketer_schools: { name: "SMK Nusantara", city: "Bandung" }
    }
  ];

  const tableData = {
    profiles,
    marketer_schools: schools,
    marketer_claims: claims
  };

  return {
    currentUser: { id: currentProfile.id, email: currentProfile.email },
    tableData
  };
}

test.describe("Student and marketer flows", {
  tag: ["@auth", "@lms", "@marketer"]
}, () => {
  test("student auth/guard allows student and blocks admin", {
    tag: "@critical"
  }, async ({ page }) => {
    const studentStub = makeStudentStub("student");
    await installSupabaseStub(page, studentStub);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/dashboard-student\.html/);
    await expect(page.locator("#section-home")).toBeVisible();

    const adminStub = makeStudentStub("admin");
    await installSupabaseStub(page, adminStub);
    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/pages/dashboard-admin.html");
  });

  test("student profile renders and logout works", async ({ page }) => {
    const stub = makeStudentStub("student");
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#profileCardName")).toHaveText("Alpha Student");
    await expect(page.locator("#profileCardId")).toHaveText("ST-001");
    await expect(page.locator("#profileCardEmail")).toHaveText("alpha@example.com");

    await page.locator("#logoutBtn").click();
    await page.waitForURL("**/pages/login.html");
  });

  test("student avatar upload persists and keeps the crop fixed", async ({ page }) => {
    const stub = makeStudentStub("student");
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#profileCardName")).toHaveText("Alpha Student");
    await page.locator(".sd-nav__item[data-section='profile']").click();
    await expect(page.locator("#section-profile")).toHaveClass(/active/);
    await page.locator("#avatarInput").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from("avatar-image")
    });

    await expect(page.locator("#avatarUploadStatus")).toContainText("Photo updated", { timeout: 15000 });
    const profile = await page.evaluate(() => (
      window.__QA_TABLE_DATA__.profiles.find((item) => item.id === "student-1")
    ));
    expect(profile.avatar_url).toContain("https://example.com/avatars/avatars/student-1.png?v=");

    const avatarBox = await page.locator("#profileAvatar").boundingBox();
    expect(Math.round(avatarBox.width)).toBe(80);
    expect(Math.round(avatarBox.height)).toBe(80);
    await expect(page.locator("#profileAvatar img")).toHaveCSS("object-fit", "cover");
    await expect(page.locator("#profileAvatar img")).toHaveCSS("object-position", "50% 50%");
  });

  test("student avatar upload reports profile persistence failure", async ({ page }) => {
    const stub = makeStudentStub("student");
    stub.tableData.__failProfileAvatarUpdate = true;
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#profileCardName")).toHaveText("Alpha Student");
    await page.locator(".sd-nav__item[data-section='profile']").click();
    await expect(page.locator("#section-profile")).toHaveClass(/active/);
    await page.locator("#avatarInput").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from("avatar-image")
    });

    await expect(page.locator("#avatarUploadStatus")).toContainText("Upload failed", { timeout: 15000 });
    await expect(page.locator("#profileAvatar img")).toHaveCount(0);
    const profile = await page.evaluate(() => (
      window.__QA_TABLE_DATA__.profiles.find((item) => item.id === "student-1")
    ));
    expect(profile.avatar_url).toBeUndefined();
  });

  test("student home renders progress and lazy-loads courses on section open", async ({ page }) => {
    const stub = makeStudentStub("student");
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#statCoursesEnrolled")).toHaveText("2");
    await expect(page.locator(".sd-progress__pct")).toContainText("65%");
    await expect(page.locator("#courseGrid .sd-course-card")).toHaveCount(0);

    await page.locator(".sd-nav__item[data-section='courses']").click();

    await expect(page.locator("#courseGrid .sd-course-card")).toHaveCount(2);
    await expect(page.locator("#courseGrid .sd-course-card[data-status='completed']")).toHaveCount(1);
  });

  test("student navigation opens sections without console errors", async ({ page }) => {
    const stub = makeStudentStub("student");
    await installSupabaseStub(page, stub);
    const consoleErrors = collectConsoleErrors(page);

    await page.goto("/pages/dashboard-student.html");

    const sections = [
      "home",
      "courses",
      "assignments",
      "schedule",
      "certificates",
      "messages",
      "resources",
      "profile"
    ];

    for (const section of sections) {
      const navBtn = page.locator(`.sd-nav__item[data-section='${section}']`);
      await navBtn.click();
      await expect(page.locator(`#section-${section}`)).toHaveClass(/active/);
    }

    expect(consoleErrors, "No unexpected console errors").toHaveLength(0);
  });

  test("student assignment submit updates UI and DB state", async ({ page }) => {
    const stub = makeStudentStub("student");
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='assignments']").click();

    const pendingItem = page.locator(".sd-assignment-item[data-status='pending']");
    await expect(pendingItem).toHaveCount(1);
    await pendingItem.locator("input[type='file']").setInputFiles({
      name: "submission.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 student submission")
    });
    await pendingItem.locator("button[data-action='submit']").click();

    await page.locator(".sd-filter-tab[data-filter='submitted']").click();
    await expect(page.locator(".sd-assignment-item[data-status='submitted']")).toHaveCount(1);

    const submissions = await page.evaluate(async () => {
      const { data } = await window.lmsSupabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", "student-1");
      return data || [];
    });

    expect(submissions.some((s) => s.assignment_id === "assign-1")).toBeTruthy();
    expect(submissions.find((s) => s.assignment_id === "assign-1")?.file_urls).toEqual([
      "https://example.com/assignment-submissions/student-1/assign-1/submission.pdf"
    ]);

    const uploadedFiles = await page.evaluate(() => window.__QA_UPLOADED_FILES__);
    expect(uploadedFiles).toHaveLength(1);
    expect(uploadedFiles[0]).toMatchObject({
      bucket: "assignment-submissions",
      path: "student-1/assign-1/submission.pdf",
      name: "submission.pdf",
      options: { upsert: true, contentType: "application/pdf" }
    });
  });

  test("student assignment resubmit updates existing submission", async ({ page }) => {
    const stub = makeStudentStub("student");
    stub.tableData.assignments.push({
      id: "assign-3",
      course_id: "course-1",
      title: "Care Plan Rewrite",
      type: "assignment",
      course_title: "Caregiver Basics",
      due_at: "2026-03-27"
    });
    stub.tableData.assignment_submissions.push({
      id: "sub-3",
      assignment_id: "assign-3",
      student_id: "student-1",
      status: "resubmit_required",
      submitted_at: "2026-03-10T08:00:00.000Z",
      notes: "Please revise the patient plan.",
      file_urls: ["https://example.com/old-submission.pdf"]
    });
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='assignments']").click();

    const resubmitItem = page.locator(".sd-assignment-item[data-status='resubmit_required']");
    await expect(resubmitItem).toHaveCount(1);
    await resubmitItem.locator("input[type='file']").setInputFiles({
      name: "rewrite.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 revised student submission")
    });
    await resubmitItem.locator("button[data-action='submit']").click();

    await page.locator(".sd-filter-tab[data-filter='submitted']").click();
    await expect(
      page.locator(".sd-assignment-item[data-status='submitted']").filter({ hasText: "Care Plan Rewrite" })
    ).toHaveCount(1);

    const submissions = await page.evaluate(async () => {
      const { data } = await window.lmsSupabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", "assign-3");
      return data || [];
    });

    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      id: "sub-3",
      assignment_id: "assign-3",
      student_id: "student-1",
      status: "submitted",
      notes: null,
      file_urls: ["https://example.com/assignment-submissions/student-1/assign-3/rewrite.pdf"]
    });
  });

  test("marketer auth/guard allows marketer and blocks student", {
    tag: "@critical"
  }, async ({ page }) => {
    const marketerStub = makeMarketerStub("marketer");
    await installSupabaseStub(page, marketerStub);

    await page.goto("/pages/dashboard-marketer.html");
    await expect(page.locator("#marketerRole")).toHaveText("Marketer");

    const studentStub = makeMarketerStub("student");
    await installSupabaseStub(page, studentStub);
    await page.goto("/pages/dashboard-marketer.html");
    await page.waitForURL("**/pages/dashboard-student.html");
  });

  test("marketer claim form validation and submit success", async ({ page }) => {
    const stub = makeMarketerStub("marketer");
    await installSupabaseStub(page, stub);

    await page.goto("/pages/dashboard-marketer.html");
    await page.locator(".mk-nav-tab[data-tab='claim']").click();
    await expect(page.locator("#claimForm")).toBeVisible();

    await page.locator("#claimForm button[type='submit']").click();
    await expect(page.locator("#claimFormMsg")).toHaveText("Pilih sekolah dan tanggal presentasi.");

    await page.selectOption("#claimSchool", "school-1");
    await page.fill("#claimPresDate", "2026-03-10");
    await page.locator("#claimForm button[type='submit']").click();
    await expect(page.locator("#claimFormMsg")).toHaveText("Isi jumlah siswa yang hadir.");

    await page.fill("#claimStudentsPresent", "30");
    await page.fill("#claimStudentsEnrolled", "12");
    await page.fill("#claimProgramFee", "4600000");
    await page.check("#claimConsent");

    await page.locator("#claimForm button[type='submit']").click();
    await expect(page.locator("#claimFormMsg")).toHaveText(
      "Klaim berhasil diajukan! Menunggu verifikasi admin."
    );
    await expect(page.locator("#claimFormMsg")).toHaveClass(/success/);
  });

  test("marketer edge cases and staff role label", async ({ page }) => {
    const marketerStub = makeMarketerStub("marketer");
    await installSupabaseStub(page, marketerStub);

    await page.goto("/pages/dashboard-marketer.html");
    await page.locator(".mk-nav-tab[data-tab='reports']").click();

    const dupRefs = page.locator("#reportTableBody code", { hasText: "DUP-001" });
    await expect(dupRefs).toHaveCount(2);
    await expect(page.locator("#reportTableBody")).toContainText("Ditolak");

    const staffStub = makeMarketerStub("staff");
    await page.addInitScript(() => {
      window.__LMS_ENABLE_STAFF__ = true;
    });
    await installSupabaseStub(page, staffStub);
    await page.goto("/pages/dashboard-marketer.html");
    await expect(page.locator("#marketerRole")).toHaveText("Staff");
  });
});
