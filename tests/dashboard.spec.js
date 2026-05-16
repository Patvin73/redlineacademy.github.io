const { test, expect } = require("@playwright/test");

function buildSupabaseStub({ tableData, currentUser, initialPassword = "CorrectPass123!" }) {
  return `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const currentUser = ${JSON.stringify(currentUser)};
      let currentPassword = ${JSON.stringify(initialPassword)};
      const functionInvocations = [];

      window.__QA_TABLE_DATA__ = tableData;
      window.__QA_UPLOADS__ = [];
      window.__QA_FUNCTION_INVOCATIONS__ = functionInvocations;

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

      const applyOrFilter = (rows, expression) => {
        if (!expression) return rows;
        const conditions = String(expression)
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => {
            const pieces = part.split(".");
            return {
              column: pieces[0],
              operator: pieces[1],
              value: pieces.slice(2).join(".")
            };
          });

        return rows.filter((row) =>
          conditions.some((condition) => {
            const value = getValue(row, condition.column);
            if (condition.operator === "eq") return String(value) === condition.value;
            return false;
          })
        );
      };

      const createQuery = (table) => {
        if (!Array.isArray(tableData[table])) tableData[table] = [];
        const baseRows = tableData[table];
        let rows = baseRows.slice();
        let limitValue = null;

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
          or: (expression) => {
            rows = applyOrFilter(rows, expression);
            return api;
          },
          order: (col, options = {}) => {
            const ascending = options.ascending !== false;
            rows = rows.slice().sort((a, b) => {
              const left = toComparable(getValue(a, col));
              const right = toComparable(getValue(b, col));
              if (left === right) return 0;
              if (left == null) return 1;
              if (right == null) return -1;
              return ascending ? (left > right ? 1 : -1) : (left < right ? 1 : -1);
            });
            return api;
          },
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
                item.id = table + "-qa-" + Math.random().toString(36).slice(2, 10);
              }
              baseRows.push(item);
            });
            return api;
          },
          upsert: (payload, options = {}) => {
            const items = Array.isArray(payload) ? payload : [payload];
            const conflictKeys = String(options.onConflict || "id")
              .split(",")
              .map((key) => key.trim())
              .filter(Boolean);

            items.forEach((item) => {
              const existing = baseRows.find((row) =>
                conflictKeys.length > 0
                  && conflictKeys.every((key) => row[key] === item[key])
              );
              if (existing) {
                Object.assign(existing, item);
                return;
              }
              if (!item.id) {
                item.id = table + "-qa-" + Math.random().toString(36).slice(2, 10);
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
              const index = baseRows.indexOf(row);
              if (index >= 0) baseRows.splice(index, 1);
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
            signOut: async () => ({ error: null }),
            signInWithPassword: async ({ password }) => ({
              data: password === currentPassword ? { user: currentUser } : null,
              error: password === currentPassword ? null : { message: "Invalid login credentials" }
            }),
            updateUser: async ({ password }) => {
              currentPassword = password;
              return { data: { user: currentUser }, error: null };
            }
          },
          from: (table) => createQuery(table),
          functions: {
            invoke: async (name, options = {}) => {
              functionInvocations.push({ name, body: options.body || null });
              return { data: { ok: true, email_sent: true }, error: null };
            }
          },
          channel: () => ({
            on: () => ({ subscribe: () => ({}) })
          }),
          storage: {
            from: (bucket) => ({
              upload: async (path, file, options = {}) => {
                window.__QA_UPLOADS__.push({
                  bucket,
                  path,
                  name: file?.name || "",
                  type: file?.type || "",
                  options
                });
                return { error: null };
              },
              getPublicUrl: (path) => ({ data: { publicUrl: "https://example.com/" + bucket + "/" + path } })
            })
          }
        })
      };
    })();
  `;
}

async function installSupabaseStub(page, fixture) {
  const stub = buildSupabaseStub(fixture);
  await page.route("**/*supabase-js@2*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript; charset=utf-8",
      body: stub
    });
  });
}

function makeStudentFixture() {
  const studentId = "student-1";
  const trainerId = "trainer-1";

  return {
    currentUser: { id: studentId, email: "alpha@example.com" },
    tableData: {
      profiles: [
        {
          id: studentId,
          full_name: "Alpha Student",
          role: "student",
          student_id: "ST-001",
          email: "alpha@example.com",
          phone: "0812345678",
          date_of_birth: "2000-01-10",
          timezone: "Australia/Sydney",
          address: "12 Example St",
          city: "Sydney",
          postcode: "2000",
          bio: "Ready to learn.",
          batch: "2025",
          created_at: "2026-03-02T08:00:00.000Z"
        },
        {
          id: trainerId,
          full_name: "Trainer One",
          role: "trainer",
          admin_id: "TR-001",
          email: "trainer@example.com",
          created_at: "2026-03-01T08:00:00.000Z"
        },
        {
          id: "admin-1",
          full_name: "Admin One",
          role: "admin",
          admin_id: "ADM-001",
          email: "admin@example.com",
          created_at: "2026-03-01T08:00:00.000Z"
        }
      ],
      v_student_dashboard: [
        {
          student_id: studentId,
          courses_enrolled: 2,
          lessons_completed: 8,
          pending_submissions: 1,
          certificates_earned: 1
        }
      ],
      course_progress: [
        {
          student_id: studentId,
          course_id: "course-1",
          completion_percent: 65,
          last_accessed_at: "2099-01-01T08:00:00.000Z",
          last_lesson_id: "lesson-1",
          courses: { id: "course-1", title: "Aged Care Basics", thumbnail_url: "", slug: "aged-care-basics" },
          enrollments: { status: "active" }
        },
        {
          student_id: studentId,
          course_id: "course-2",
          completion_percent: 100
        }
      ],
      lessons: [
        { id: "lesson-1", course_id: "course-1" },
        { id: "lesson-2", course_id: "course-1" },
        { id: "lesson-3", course_id: "course-2" }
      ],
      lesson_progress: [
        {
          id: "lesson-progress-1",
          student_id: studentId,
          lesson_id: "lesson-1",
          course_id: "course-1",
          completed_at: "2099-01-01T08:00:00.000Z"
        }
      ],
      enrollments: [
        { id: "enroll-1", student_id: studentId, course_id: "course-1", status: "active" },
        { id: "enroll-2", student_id: studentId, course_id: "course-2", status: "completed" }
      ],
      courses: [
        {
          id: "course-1",
          title: "Aged Care Basics",
          thumbnail_url: "",
          category_id: "aged-care",
          trainer_id: trainerId,
          profiles: { admin_id: "TR-001" },
          categories: { id: "aged-care", name: "Aged Care" }
        },
        {
          id: "course-2",
          title: "First Aid Essentials",
          thumbnail_url: "",
          category_id: "first-aid",
          trainer_id: trainerId,
          profiles: { admin_id: "TR-001" },
          categories: { id: "first-aid", name: "First Aid" }
        },
        {
          id: "course-3",
          title: "Clinical Communication",
          thumbnail_url: "",
          category_id: "communication",
          trainer_id: "trainer-2",
          profiles: { admin_id: "TR-009" },
          categories: { id: "communication", name: "Communication" }
        }
      ],
      assignments: [
        {
          id: "assign-1",
          course_id: "course-1",
          title: "Module 1 Quiz",
          type: "quiz",
          course_title: "Aged Care Basics",
          due_at: "2099-01-03"
        },
        {
          id: "assign-2",
          course_id: "course-2",
          title: "Final Assignment",
          type: "assignment",
          course_title: "First Aid Essentials",
          due_at: "2099-01-06"
        },
        {
          id: "assign-3",
          course_id: "course-3",
          title: "Unenrolled Course Quiz",
          type: "quiz",
          course_title: "Clinical Communication",
          due_at: "2099-01-07"
        }
      ],
      assignment_submissions: [
        {
          id: "sub-1",
          assignment_id: "assign-2",
          student_id: studentId,
          status: "graded",
          submitted_at: "2099-01-02T09:00:00.000Z"
        }
      ],
      schedules: [
        {
          id: "sched-1",
          course_id: "course-1",
          title: "Live Session",
          event_type: "live_session",
          start_datetime: "2099-01-10T10:00:00.000Z",
          end_datetime: "2099-01-10T11:00:00.000Z",
          meeting_url: "https://example.com/live-session"
        },
        {
          id: "sched-2",
          course_id: "course-1",
          title: "Skills Exam",
          event_type: "exam",
          start_datetime: "2099-01-12T09:00:00.000Z",
          end_datetime: "2099-01-12T10:00:00.000Z",
          meeting_url: ""
        }
      ],
      certificates: [
        {
          id: "cert-1",
          student_id: studentId,
          certificate_no: "CERT-001",
          issued_at: "2099-01-05T09:00:00.000Z",
          file_url: "https://example.com/cert.pdf",
          courses: { title: "Aged Care Basics" }
        }
      ],
      messages: [
        {
          id: "msg-1",
          sender_id: trainerId,
          recipient_id: studentId,
          subject: "Welcome",
          body: "Please review module one.",
          is_read: false,
          created_at: "2099-01-01T09:00:00.000Z",
          profiles: { full_name: "Trainer One", avatar_url: null }
        },
        {
          id: "msg-2",
          sender_id: studentId,
          recipient_id: trainerId,
          subject: "Question",
          body: "I have a follow-up question.",
          is_read: true,
          created_at: "2099-01-02T09:00:00.000Z",
          profiles: { full_name: "Alpha Student", avatar_url: null }
        }
      ],
      notifications: [
        {
          id: "notif-1",
          user_id: studentId,
          type: "new_message",
          title: "New message from trainer",
          is_read: false,
          read_at: null,
          created_at: "2099-01-01T08:00:00.000Z"
        },
        {
          id: "notif-2",
          user_id: studentId,
          type: "assignment_graded",
          title: "Assignment graded",
          is_read: false,
          read_at: null,
          created_at: "2099-01-02T08:00:00.000Z"
        }
      ],
      activity_logs: []
    }
  };
}

function makeMarketerFixture() {
  const marketerId = "marketer-1";

  return {
    currentUser: { id: marketerId, email: "marketer@example.com" },
    tableData: {
      profiles: [
        {
          id: marketerId,
          full_name: "Marketer One",
          role: "marketer",
          email: "marketer@example.com"
        }
      ],
      marketer_schools: [
        {
          id: "school-1",
          marketer_id: marketerId,
          name: "SMK Nusantara",
          city: "Bandung",
          contact_name: "Pak Arif",
          phone: "08123456789",
          notes: "",
          status: "active",
          created_at: "2099-01-01T08:00:00.000Z"
        }
      ],
      marketer_claims: [
        {
          id: "claim-1",
          marketer_id: marketerId,
          school_id: "school-1",
          ref_id: "RA-COM-001",
          presentation_date: "2099-01-05",
          students_present: 40,
          students_enrolled: 6,
          program_fee: 4600000,
          access_fee: 350000,
          enrollment_comm: 2760000,
          bonus: 500000,
          total_commission: 3610000,
          status: "pending",
          notes: "Waiting review",
          created_at: "2099-01-06T08:00:00.000Z",
          marketer_schools: { name: "SMK Nusantara", city: "Bandung" }
        }
      ]
    }
  };
}

test.describe("Student Dashboard", () => {
  test("refreshes profile form when returning to profile section", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#sidebarName")).toHaveText("Alpha Student");
    await page.locator(".sd-nav__item[data-section='profile']").click();

    await expect(page.locator("#pfFullName")).toHaveValue("Alpha Student");
    await page.fill("#pfFullName", "Unsaved Student Name");

    await page.locator(".sd-nav__item[data-section='courses']").click();
    await expect(page.locator("#section-courses")).toHaveClass(/active/);

    await page.locator(".sd-nav__item[data-section='profile']").click();
    await expect(page.locator("#pfFullName")).toHaveValue("Alpha Student");
  });

  test("saves profile changes and updates visible student name", async ({ page }) => {
    // This test covers the profile save flow that is not covered by the older dashboard tests.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='profile']").click();

    await page.fill("#pfFullName", "Alpha Student Updated");
    await page.fill("#pfCity", "Jakarta");
    await page.click("#saveProfileBtn");

    await expect(page.locator("#profileMsg")).toContainText("Changes saved successfully");
    await expect(page.locator("#sidebarName")).toHaveText("Alpha Student Updated");
    await expect(page.locator("#profileCardName")).toHaveText("Alpha Student Updated");

    const profile = await page.evaluate(() =>
      window.__QA_TABLE_DATA__.profiles.find((row) => row.id === "student-1")
    );
    expect(profile.city).toBe("Jakarta");
    expect(profile.full_name).toBe("Alpha Student Updated");
  });

  test("uploads avatar with content type and visible status feedback", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='profile']").click();

    await page.setInputFiles("#avatarInput", {
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47])
    });

    await expect(page.locator("#avatarUploadStatus")).toContainText("Photo updated");
    await expect(page.locator("#avatarUploadBtn")).toBeEnabled();

    const result = await page.evaluate(() => ({
      uploads: window.__QA_UPLOADS__,
      avatarUrl: window.__QA_TABLE_DATA__.profiles.find((row) => row.id === "student-1")?.avatar_url
    }));

    expect(result.uploads).toEqual([
      expect.objectContaining({
        bucket: "avatars",
        path: "avatars/student-1.png",
        name: "avatar.png",
        type: "image/png",
        options: { upsert: true, contentType: "image/png" }
      })
    ]);
    expect(result.avatarUrl).toContain("https://example.com/avatars/avatars/student-1.png?v=");
  });

  test("validates and updates student password from the accordion", async ({ page }) => {
    // This test covers the password accordion flow and its validation messages.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='profile']").click();
    await page.click("#changePasswordToggle");

    await page.click("#changePasswordBtn");
    await expect(page.locator("#passwordMsg")).toContainText("Current password is required");

    await page.fill("#pfCurrentPw", "CorrectPass123!");
    await page.fill("#pfNewPw", "NewStrongPass1");
    await page.fill("#pfConfirmPw", "NewStrongPass1");
    await page.click("#changePasswordBtn");

    await expect(page.locator("#passwordMsg")).toContainText("Password updated");
    await expect(page.locator("#pfCurrentPw")).toHaveValue("");
    await expect(page.locator("#pfNewPw")).toHaveValue("");
    await expect(page.locator("#pfConfirmPw")).toHaveValue("");
  });

  test("shows all courses with creator IDs, including courses not yet enrolled", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='courses']").click();

    await expect(page.locator("#courseGrid .sd-course-card")).toHaveCount(3);
    await expect(page.locator("#courseGrid")).toContainText("Aged Care Basics");
    await expect(page.locator("#courseGrid")).toContainText("First Aid Essentials");
    await expect(page.locator("#courseGrid")).toContainText("Clinical Communication");
    await expect(page.locator("#courseGrid")).toContainText("Aged Care");
    await expect(page.locator("#courseGrid")).toContainText("First Aid");
    await expect(page.locator("#courseGrid")).toContainText("Communication");
    await expect(page.locator("#courseGrid")).toContainText("Creator ID: TR-001");
    await expect(page.locator("#courseGrid")).toContainText("Creator ID: TR-009");
    await expect(page.locator("#courseGrid .sd-course-card[data-status='available']")).toHaveCount(1);
  });

  test("updates course progress when the lesson viewer marks a lesson complete", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#continueLearningContent")).toContainText("Aged Care Basics");

    await page.evaluate(async () => {
      await window.lmsMarkLessonCompleted("lesson-2", "course-1");
    });

    const progressState = await page.evaluate(() => {
      const rows = window.__QA_TABLE_DATA__;
      return {
        lessonProgress: rows.lesson_progress.find((row) =>
          row.student_id === "student-1" && row.lesson_id === "lesson-2"
        ),
        courseProgress: rows.course_progress.find((row) =>
          row.student_id === "student-1" && row.course_id === "course-1"
        ),
        activityLog: rows.activity_logs.find((row) =>
          row.action === "lesson_completed" && row.entity_id === "lesson-2"
        ),
        certificate: rows.certificates.find((row) =>
          row.student_id === "student-1" && row.course_id === "course-1"
        )
      };
    });

    expect(progressState.lessonProgress).toEqual(expect.objectContaining({
      student_id: "student-1",
      lesson_id: "lesson-2",
      course_id: "course-1"
    }));
    expect(progressState.courseProgress).toEqual(expect.objectContaining({
      completion_percent: 100,
      last_lesson_id: "lesson-2"
    }));
    expect(progressState.activityLog).toEqual(expect.objectContaining({
      user_id: "student-1",
      action: "lesson_completed",
      entity_type: "lesson",
      entity_id: "lesson-2",
      metadata: { course_id: "course-1", lesson_id: "lesson-2" }
    }));
    expect(progressState.certificate).toEqual(expect.objectContaining({
      certificate_no: "CERT-STUDEN-COURSE"
    }));
  });

  test("loads assignments from enrolled courses and maps submission status", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='assignments']").click();

    await expect(page.locator("#assignmentList .sd-assignment-item")).toHaveCount(2);
    await expect(page.locator("#assignmentList")).toContainText("Module 1 Quiz");
    await expect(page.locator("#assignmentList")).toContainText("Final Assignment");
    await expect(page.locator("#assignmentList")).not.toContainText("Unenrolled Course Quiz");
    await expect(page.locator(".sd-assignment-item[data-status='pending']")).toHaveCount(1);

    await page.locator(".sd-filter-tab[data-filter='graded']").click();
    await expect(page.locator(".sd-assignment-item[data-status='graded']")).toBeVisible();
    await expect(page.locator(".sd-assignment-item[data-status='graded']")).toContainText("Final Assignment");
  });

  test("switches schedule view from list to calendar using real dashboard controls", async ({ page }) => {
    // This test covers the list/calendar schedule toggle, which existing tests do not exercise.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='schedule']").click();

    await expect(page.locator("#scheduleFullList .sd-schedule-item")).toHaveCount(2);
    await expect(page.locator("#scheduleFullList a", { hasText: "Join" })).toHaveCount(1);

    await page.click(".sd-view-btn[data-view='calendar']");

    await expect(page.locator(".sd-view-btn[data-view='calendar']")).toHaveClass(/active/);
    await expect(page.locator("#scheduleFullList .sd-schedule-item")).toHaveCount(0);
    await expect(page.locator("#scheduleFullList [data-schedule-render='true']")).not.toHaveCount(0);
  });

  test("filters resource cards by category and search text", async ({ page }) => {
    // This test covers the resources filter tabs and search box together.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='resources']").click();

    await expect(page.locator("#resourceGrid [data-resource-card='true']")).toHaveCount(2);

    await page.click("#resourceCategoryTabs .sd-filter-tab[data-category='aged-care']");
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Aged Care Basics" })).toBeVisible();
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "First Aid Essentials" })).toBeHidden();

    await page.click("#resourceCategoryTabs .sd-filter-tab[data-category='all']");
    await page.fill("#resourceSearch", "first aid");
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "First Aid Essentials" })).toBeVisible();
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Aged Care Basics" })).toBeHidden();
  });

  test("marks notifications and messages read from the student indicators", async ({ page }) => {
    // This test covers the notification panel action and verifies message unread state keeps the bell on until read.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#notifDot")).toBeVisible();
    await expect(page.locator("#messageBadge")).toHaveText("1");

    await page.click("#sdNotifBtn");
    await expect(page.locator(".sd-notif-list-item.unread")).toHaveCount(2);
    await page.click("#markAllRead");

    await expect(page.locator("#notifDot")).toBeVisible();
    await expect(page.locator(".sd-notif-list-item.unread")).toHaveCount(0);

    const unread = await page.evaluate(() =>
      window.__QA_TABLE_DATA__.notifications.filter((row) => !row.is_read).length
    );
    expect(unread).toBe(0);

    await page.locator(".sd-nav__item[data-section='messages']").click();
    await page.locator(".sd-inbox-item", { hasText: "Please review module one." }).click();
    await expect(page.locator("#messageBadge")).toBeHidden();
    await expect(page.locator("#notifDot")).toBeHidden();

    const messages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
    expect(messages.find((msg) => msg.id === "msg-1")).toEqual(expect.objectContaining({
      is_read: true,
      recipient_id: "student-1"
    }));
  });

  test("student composes a message to multiple recipients across roles", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#welcomeName")).toHaveText("Alpha Student");
    await page.evaluate(() => {
      window.prompt = () => {
        throw new Error("Student compose must not use window.prompt");
      };
    });

    await page.locator(".sd-nav__item[data-section='messages']").click();
    await page.locator("#newMessageBtn").click();

    await expect(page.locator("#studentMsgComposeForm")).toBeVisible();
    await expect(page.locator("#messageViewEmpty")).toBeHidden();

    const recipients = await page.locator("#studentMsgRecipient option").allTextContents();
    expect(recipients).toContain("Trainer One");
    expect(recipients).toContain("Admin One");
    expect(recipients).not.toContain("Alpha Student");

    await page.locator("#studentMsgRecipientToggle").click();
    await page.locator("#studentMsgRecipientPanel label", { hasText: "Trainer One" }).locator("input").check();
    await page.locator("#studentMsgRecipientPanel label", { hasText: "Admin One" }).locator("input").check();
    await expect(page.locator("#studentMsgRecipientSummary")).toHaveText(/2 (recipients selected|penerima dipilih)/);
    await page.fill("#studentMsgSubject", "Question about Module 1");
    await page.fill("#studentMsgBody", "Can you review my answer?");
    await page.locator("#studentSendMsgBtn").click();

    await expect(page.locator("#studentMsgComposeMsg")).toContainText(/Message sent\.|Pesan terkirim\./);
    await expect(page.locator("#section-messages")).toHaveClass(/active/);

    const sentMessages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
    const sentMessagesForRecipients = sentMessages.filter((msg) =>
      msg.sender_id === "student-1" &&
      msg.subject === "Question about Module 1" &&
      msg.body === "Can you review my answer?"
    );
    expect(sentMessagesForRecipients).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sender_id: "student-1",
        recipient_id: "trainer-1",
        subject: "Question about Module 1",
        body: "Can you review my answer?"
      }),
      expect.objectContaining({
        sender_id: "student-1",
        recipient_id: "admin-1",
        subject: "Question about Module 1",
        body: "Can you review my answer?"
      })
    ]));
    const emailInvocations = await page.evaluate(() => window.__QA_FUNCTION_INVOCATIONS__);
    sentMessagesForRecipients.forEach((message) => {
      expect(emailInvocations).toEqual(expect.arrayContaining([
        { name: "send-message-email", body: { message_id: message.id } }
      ]));
    });
    await expect(page.locator("#studentMsgComposeForm")).toBeHidden();
  });
});

test.describe("Marketer Dashboard", () => {
  test("adds a new school and edits it from the schools panel", async ({ page }) => {
    // This test covers marketer school create/edit flows that were not in the older suite.
    const fixture = makeMarketerFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-marketer.html");
    await page.locator(".mk-nav-tab[data-tab='schools']").click();

    await page.click("#addSchoolBtn");
    await page.fill("#schoolName", "SMK Harapan");
    await page.fill("#schoolCity", "Surabaya");
    await page.fill("#schoolContact", "Bu Rina");
    await page.click("#saveSchoolBtn");

    await expect(page.locator("#schoolTableBody")).toContainText("SMK Harapan");
    await expect(page.locator("#schoolCountBadge")).toHaveText("2");

    await page.locator("#schoolTableBody button", { hasText: "Edit" }).last().click();
    await page.fill("#schoolCity", "Malang");
    await page.click("#saveSchoolBtn");

    await expect(page.locator("#schoolTableBody")).toContainText("Malang");
  });

  test("recalculates commission values and resets the claim form", async ({ page }) => {
    // This test covers the live calculator and reset button without duplicating submit-success tests.
    const fixture = makeMarketerFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-marketer.html");
    await page.locator(".mk-nav-tab[data-tab='claim']").click();

    await page.selectOption("#claimSchool", "school-1");
    await page.fill("#claimStudentsPresent", "30");
    await page.fill("#claimStudentsEnrolled", "6");
    await page.fill("#claimProgramFee", "4600000");

    await expect(page.locator("#calcAccessFee")).toHaveText("Rp 350.000");
    await expect(page.locator("#calcBonus")).toHaveText("Rp 500.000");
    await expect(page.locator("#calcTotal")).toHaveText("Rp 3.610.000");

    await page.click("#claimResetBtn");

    await expect(page.locator("#claimSchool")).toHaveValue("");
    await expect(page.locator("#claimStudentsPresent")).toHaveValue("");
    await expect(page.locator("#claimStudentsEnrolled")).toHaveValue("");
    await expect(page.locator("#claimProgramFee")).toHaveValue("");
    await expect(page.locator("#calcTotal")).toHaveText("Rp 0");
  });

  test("opens report detail and returns back to the reports list", async ({ page }) => {
    // This test covers the marketer report detail view and back navigation.
    const fixture = makeMarketerFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-marketer.html");
    await page.locator(".mk-nav-tab[data-tab='reports']").click();

    await page.locator("#reportTableBody button", { hasText: "Lihat" }).first().click();
    await expect(page.locator("#reportDetail")).toBeVisible();
    await expect(page.locator("#detailRefId")).toHaveText("RA-COM-001");
    await expect(page.locator("#detailSchool")).toHaveText("SMK Nusantara");
    await expect(page.locator("#detailStatusPill")).toContainText("Menunggu");
    await expect(page.locator("#detailTotal")).toHaveText("Rp 3.610.000");

    await page.click("#backToReports");
    await expect(page.locator("#reportsList")).toBeVisible();
  });
});
