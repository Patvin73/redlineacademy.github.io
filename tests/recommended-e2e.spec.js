const { test, expect } = require("@playwright/test");

function buildSupabaseStub({ tableData, currentUser }) {
  return `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const currentUser = ${JSON.stringify(currentUser)};

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

        const api = {
          select: () => api,
          eq: (col, val) => {
            rows = rows.filter((row) => {
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
            rows.forEach((row) => Object.assign(row, payload));
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
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          return resolve(makeResponse(data));
        };
        api.catch = (reject) => Promise.resolve(makeResponse(rows)).catch(reject);
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
            from: () => ({
              upload: async () => ({ error: null }),
              getPublicUrl: () => ({ data: { publicUrl: "" } })
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
      student_id: "student-1",
      title: "Module 1 Quiz",
      type: "quiz",
      course_title: "Caregiver Basics",
      due_at: "2026-03-20"
    },
    {
      id: "assign-2",
      student_id: "student-1",
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
      program_fee: 5000000,
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
      program_fee: 4000000,
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

test("student auth/guard allows student and blocks admin", async ({ page }) => {
  const studentStub = makeStudentStub("student");
  await installSupabaseStub(page, studentStub);

  await page.goto("/pages/dashboard-student.html");
  await expect(page).toHaveURL(/dashboard-student\.html/);
  await expect(page.locator("#section-home")).toBeVisible();

  const adminStub = makeStudentStub("admin");
  await installSupabaseStub(page, adminStub);
  await page.goto("/pages/dashboard-student.html");
  await page.waitForURL("**/pages/dashboard-admin.html");
});

test("student profile renders and logout works", async ({ page }) => {
  const stub = makeStudentStub("student");
  await installSupabaseStub(page, stub);

  await page.goto("/pages/dashboard-student.html");
  await expect(page.locator("#profileCardName")).toHaveText("Alpha Student");
  await expect(page.locator("#profileCardId")).toContainText("STUDENT");
  await expect(page.locator("#profileCardEmail")).toHaveText("alpha@example.com");

  await page.locator("#logoutBtn").click();
  await page.waitForURL("**/pages/login.html");
});

test("student data renders with progress and courses", async ({ page }) => {
  const stub = makeStudentStub("student");
  await installSupabaseStub(page, stub);

  await page.goto("/pages/dashboard-student.html");
  await expect(page.locator("#statCoursesEnrolled")).toHaveText("2");
  await expect(page.locator(".sd-progress__pct")).toContainText("65%");
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
});

test("marketer auth/guard allows marketer and blocks student", async ({ page }) => {
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
  await page.fill("#claimProgramFee", "5000000");
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
  await installSupabaseStub(page, staffStub);
  await page.goto("/pages/dashboard-marketer.html");
  await expect(page.locator("#marketerRole")).toHaveText("Staff");
});
