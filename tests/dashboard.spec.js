const { test, expect } = require("@playwright/test");

function buildSupabaseStub({ tableData, currentUser, initialPassword = "CorrectPass123!" }) {
  return `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const currentUser = ${JSON.stringify(currentUser)};
      let currentPassword = ${JSON.stringify(initialPassword)};

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
          channel: () => ({
            on: () => ({ subscribe: () => ({}) })
          }),
          storage: {
            from: () => ({
              upload: async () => ({ error: null }),
              getPublicUrl: (path) => ({ data: { publicUrl: "https://example.com/" + path } })
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
          categories: { id: "aged-care", name: "Aged Care" }
        },
        {
          id: "course-2",
          title: "First Aid Essentials",
          thumbnail_url: "",
          category_id: "first-aid",
          trainer_id: trainerId,
          categories: { id: "first-aid", name: "First Aid" }
        }
      ],
      assignments: [
        {
          id: "assign-1",
          student_id: studentId,
          title: "Module 1 Quiz",
          type: "quiz",
          course_title: "Aged Care Basics",
          due_at: "2099-01-03"
        },
        {
          id: "assign-2",
          student_id: studentId,
          title: "Final Assignment",
          type: "assignment",
          course_title: "First Aid Essentials",
          due_at: "2099-01-06"
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

  test("marks all notifications as read from the student notification panel", async ({ page }) => {
    // This test covers the notification panel action and verifies the data state changes too.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#notifDot")).toBeVisible();

    await page.click("#sdNotifBtn");
    await expect(page.locator(".sd-notif-list-item.unread")).toHaveCount(2);
    await page.click("#markAllRead");

    await expect(page.locator("#notifDot")).toBeHidden();
    await expect(page.locator(".sd-notif-list-item.unread")).toHaveCount(0);

    const unread = await page.evaluate(() =>
      window.__QA_TABLE_DATA__.notifications.filter((row) => !row.is_read).length
    );
    expect(unread).toBe(0);
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
