const { test, expect } = require("@playwright/test");

async function expectThreadMessageFullyVisible(page, threadSelector, messageSelector, edge) {
  await expect.poll(async () => page.locator(threadSelector).evaluate((thread, selector) => {
    const edgeMessage = thread.querySelector(selector);
    if (!edgeMessage) return false;
    const scroller = thread.closest("#messageDetail") || thread;
    const header = scroller.querySelector(".sd-msg-detail-header");
    const threadRect = scroller.getBoundingClientRect();
    const minTop = header ? Math.max(threadRect.top, header.getBoundingClientRect().bottom) : threadRect.top;
    const messageRect = edgeMessage.getBoundingClientRect();
    return messageRect.top >= minTop - 1
      && messageRect.bottom <= threadRect.bottom + 1;
  }, `${messageSelector}:${edge}-child`)).toBe(true);
}

async function expectFirstThreadMessageFullyVisible(page, threadSelector, messageSelector) {
  await expectThreadMessageFullyVisible(page, threadSelector, messageSelector, "first");
}

async function expectLastThreadMessageFullyVisible(page, threadSelector, messageSelector) {
  await expectThreadMessageFullyVisible(page, threadSelector, messageSelector, "last");
}

async function expectRightPanelWheelScrolls(page, panelSelector) {
  const panel = page.locator(panelSelector);
  await panel.evaluate((el) => {
    el.style.height = "220px";
    el.style.maxHeight = "220px";
    el.scrollTop = 0;
  });
  await expect.poll(async () => panel.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await page.locator(panelSelector).hover({ position: { x: 20, y: 20 } });
  await page.mouse.wheel(0, 500);
  await expect.poll(async () => panel.evaluate((el) => el.scrollTop > 0)).toBe(true);
  await page.mouse.wheel(0, -500);
  await expect.poll(async () => panel.evaluate((el) => el.scrollTop === 0)).toBe(true);
  await panel.evaluate((el) => {
    el.style.height = "";
    el.style.maxHeight = "";
    el.scrollTop = 0;
  });
}

function buildSupabaseStub({ tableData, currentUser, initialPassword = "CorrectPass123!", missingViews = [] }) {
  return `
    (() => {
      const tableData = ${JSON.stringify(tableData)};
      const currentUser = ${JSON.stringify(currentUser)};
      const missingViews = ${JSON.stringify(missingViews)};
      let currentPassword = ${JSON.stringify(initialPassword)};
      const functionInvocations = [];
      const rpcInvocations = [];
      const channelHandlers = [];

      window.__QA_TABLE_DATA__ = tableData;
      window.__QA_UPLOADS__ = [];
      window.__QA_FUNCTION_INVOCATIONS__ = functionInvocations;
      window.__QA_RPC_INVOCATIONS__ = rpcInvocations;
      window.__QA_CHANNEL_HANDLERS__ = channelHandlers;
      window.__QA_TRIGGER_CHANNEL = async (channelName, tableName, eventName) => {
        const matches = channelHandlers.filter((entry) =>
          entry.channelName === channelName &&
          (!tableName || entry.filter?.table === tableName) &&
          (!eventName || entry.filter?.event === eventName)
        );
        for (const entry of matches) await entry.callback({});
        return matches.length;
      };

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
        const splitTopLevel = (value) => {
          const parts = [];
          let depth = 0;
          let current = "";
          String(value).split("").forEach((char) => {
            if (char === "," && depth === 0) {
              if (current.trim()) parts.push(current.trim());
              current = "";
              return;
            }
            if (char === "(") depth += 1;
            if (char === ")") depth = Math.max(0, depth - 1);
            current += char;
          });
          if (current.trim()) parts.push(current.trim());
          return parts;
        };
        const matchesCondition = (row, part) => {
          const pieces = part.split(".");
          const condition = {
            column: pieces[0],
            operator: pieces[1],
            value: pieces.slice(2).join(".")
          };
          const rawValue = getValue(row, condition.column);
          const value = condition.column === "is_archived" && typeof rawValue === "undefined"
            ? false
            : rawValue;
          if (condition.operator === "eq") return String(value) === condition.value;
          if (condition.operator === "is" && condition.value === "null") {
            return rawValue === null || typeof rawValue === "undefined";
          }
          return false;
        };
        const matchesGroup = (row, part) => {
          if (part.startsWith("and(") && part.endsWith(")")) {
            return splitTopLevel(part.slice(4, -1)).every((condition) => matchesCondition(row, condition));
          }
          return matchesCondition(row, part);
        };
        const conditions = splitTopLevel(expression);

        return rows.filter((row) =>
          conditions.some((condition) => matchesGroup(row, condition))
        );
      };

      const createQuery = (table) => {
        if (!Array.isArray(tableData[table])) tableData[table] = [];
        const baseRows = tableData[table];
        let rows = baseRows.slice();
        let limitValue = null;
        let pendingUpdate = null;
        let queryError = missingViews.includes(table)
          ? { code: "42P01", message: 'relation "' + table + '" does not exist' }
          : null;

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
              const value = col === "is_archived" && typeof getValue(row, col) === "undefined"
                ? false
                : getValue(row, col);
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
          not: (col, operator, val) => {
            rows = rows.filter((row) => {
              const value = getValue(row, col);
              if (operator === "is" && val === null) return value !== null && typeof value !== "undefined";
              return value !== val;
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
          single: () => Promise.resolve(queryError
            ? { data: null, error: queryError }
            : rows[0]
            ? { data: rows[0], error: null }
            : { data: null, error: { code: "PGRST116", message: "No rows returned" } }),
          maybeSingle: () => Promise.resolve(queryError ? { data: null, error: queryError } : { data: rows[0] || null, error: null }),
          insert: (payload) => {
            const items = Array.isArray(payload) ? payload : [payload];
            items.forEach((item) => {
              if (!item.id) {
                item.id = table + "-qa-" + Math.random().toString(36).slice(2, 10);
              }
              baseRows.push(item);
            });
            rows = items;
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
            pendingUpdate = payload;
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
          if (pendingUpdate) {
            rows.forEach((row) => Object.assign(row, pendingUpdate));
            pendingUpdate = null;
          }
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          return resolve(queryError ? { data: null, error: queryError, count: 0 } : makeResponse(data));
        };
        api.catch = (reject) => {
          if (pendingUpdate) {
            rows.forEach((row) => Object.assign(row, pendingUpdate));
            pendingUpdate = null;
          }
          const data = limitValue ? rows.slice(0, limitValue) : rows;
          const response = queryError ? { data: null, error: queryError, count: 0 } : makeResponse(data);
          return Promise.resolve(response).catch(reject);
        };
        return api;
      };

      const recalculateCourseProgress = (params = {}) => {
        const studentId = params.p_student_id;
        const courseId = params.p_course_id;
        const lastLessonId = params.p_last_lesson_id || null;
        if (!studentId || !courseId) {
          return { data: null, error: { message: "p_student_id and p_course_id are required" } };
        }

        const enrollment = (tableData.enrollments || []).find((row) =>
          row.student_id === studentId && row.course_id === courseId
        );
        if (!enrollment) {
          return { data: null, error: { message: "Enrollment not found for student/course" } };
        }

        const lessonIds = (tableData.lessons || [])
          .filter((lesson) => lesson.course_id === courseId)
          .map((lesson) => lesson.id)
          .filter(Boolean);
        const completedLessonIds = new Set(
          (tableData.progress || [])
            .filter((row) => row.student_id === studentId && row.completed === true && lessonIds.includes(row.lesson_id))
            .map((row) => row.lesson_id)
        );

        const assignments = (tableData.assignments || []).filter((assignment) => assignment.course_id === courseId);
        const assignmentIds = assignments.map((assignment) => assignment.id).filter(Boolean);
        const passMarkByAssignment = new Map(assignments.map((assignment) => [assignment.id, Number(assignment.pass_mark || 70)]));
        const passedAssignmentIds = new Set();
        (tableData.assignment_submissions || []).forEach((submission) => {
          const assignmentId = submission.assignment_id;
          const grade = Number(submission.grade);
          if (
            assignmentIds.includes(assignmentId) &&
            submission.student_id === studentId &&
            submission.status === "graded" &&
            Number.isFinite(grade) &&
            grade >= (passMarkByAssignment.get(assignmentId) || 70)
          ) {
            passedAssignmentIds.add(assignmentId);
          }
        });

        const totalUnits = lessonIds.length + assignmentIds.length;
        const completionPercent = totalUnits > 0
          ? Math.min(100, Math.round(((completedLessonIds.size + passedAssignmentIds.size) / totalUnits) * 100))
          : 0;
        const now = new Date().toISOString();
        let courseProgress = (tableData.course_progress || []).find((row) =>
          row.student_id === studentId && row.course_id === courseId
        );
        if (!courseProgress) {
          courseProgress = {
            id: "course-progress-qa-" + Math.random().toString(36).slice(2, 10),
            student_id: studentId,
            course_id: courseId
          };
          tableData.course_progress = tableData.course_progress || [];
          tableData.course_progress.push(courseProgress);
        }

        Object.assign(courseProgress, {
          enrollment_id: enrollment.id || courseProgress.enrollment_id || null,
          completion_percent: completionPercent,
          lessons_completed: completedLessonIds.size,
          last_accessed_at: now,
          updated_at: now
        });
        if (lastLessonId) courseProgress.last_lesson_id = lastLessonId;

        if (["active", "completed"].includes(enrollment.status || "active")) {
          enrollment.status = completionPercent >= 100 ? "completed" : "active";
          enrollment.completed_at = completionPercent >= 100 ? (enrollment.completed_at || now) : null;
          enrollment.updated_at = now;
        }

        if (completionPercent >= 100) {
          tableData.certificates = tableData.certificates || [];
          if (!tableData.certificates.some((row) => row.student_id === studentId && row.course_id === courseId)) {
            tableData.certificates.push({
              id: "certificate-qa-" + Math.random().toString(36).slice(2, 10),
              student_id: studentId,
              course_id: courseId,
              issued_at: now
            });
          }
        }

        return {
          data: {
            student_id: studentId,
            course_id: courseId,
            completion_percent: completionPercent,
            completed_lessons: completedLessonIds.size,
            passed_assignments: passedAssignmentIds.size,
            total_lessons: lessonIds.length,
            total_assignments: assignmentIds.length,
            total_units: totalUnits
          },
          error: null
        };
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
          rpc: async (name, params = {}) => {
            rpcInvocations.push({ name, params });
            if (name === "recalculate_course_progress") {
              return recalculateCourseProgress(params);
            }
            return { data: null, error: { message: "Unknown RPC: " + name } };
          },
          functions: {
            invoke: async (name, options = {}) => {
              functionInvocations.push({ name, body: options.body || null });
              return { data: { ok: true, email_sent: true }, error: null };
            }
          },
          channel: (channelName) => {
            const channelApi = {
              on: (eventName, filter, callback) => {
                channelHandlers.push({ channelName, eventName, filter, callback });
                return channelApi;
              },
              subscribe: () => channelApi
            };
            return channelApi;
          },
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
              createSignedUrl: async (path) => ({
                data: { signedUrl: "https://example.com/signed/" + bucket + "/" + path },
                error: null
              }),
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
          id: "course-progress-1",
          student_id: studentId,
          course_id: "course-1",
          completion_percent: 65,
          last_accessed_at: "2099-01-01T08:00:00.000Z",
          last_lesson_id: "lesson-1",
          courses: {
            id: "course-1",
            title: "Aged Care Basics",
            thumbnail_url: "https://example.com/course-materials/courses/thumbnails/aged-care-basics.png",
            slug: "aged-care-basics"
          },
          enrollments: { status: "active" }
        },
        {
          id: "course-progress-2",
          student_id: studentId,
          course_id: "course-2",
          completion_percent: 100
        }
      ],
      lessons: [
        {
          id: "lesson-1",
          course_id: "course-1",
          title: "Safe Transfers Video",
          material_type: "video",
          material_url: "https://example.com/course-materials/courses/course-1/module-1/safe-transfers.mp4",
          material_path: "courses/course-1/module-1/safe-transfers.mp4",
          lesson_order: 1,
          courses: { id: "course-1", title: "Aged Care Basics", enrollment_type: "paid" }
        },
        {
          id: "lesson-2",
          course_id: "course-1",
          title: "Care Plan Notes",
          material_type: "text",
          material_url: null,
          lesson_order: 2,
          courses: { id: "course-1", title: "Aged Care Basics", enrollment_type: "paid" }
        },
        {
          id: "lesson-3",
          course_id: "course-2",
          title: "First Aid PDF",
          material_type: "pdf",
          material_url: "https://example.com/first-aid.pdf",
          lesson_order: 1,
          courses: { id: "course-2", title: "First Aid Essentials", enrollment_type: "paid" }
        }
      ],
      progress: [
        {
          id: "progress-1",
          student_id: studentId,
          lesson_id: "lesson-1",
          completed: true,
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
          thumbnail_url: "https://example.com/course-materials/courses/thumbnails/aged-care-basics.png",
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
          pass_mark: 70,
          due_at: "2099-01-06"
        },
        {
          id: "assign-4",
          course_id: "course-1",
          title: "Care Plan Rewrite",
          type: "assignment",
          course_title: "Aged Care Basics",
          due_at: "2099-01-08"
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
          grade: 88,
          feedback: "Strong practical reasoning.",
          submitted_at: "2099-01-02T09:00:00.000Z"
        },
        {
          id: "sub-2",
          assignment_id: "assign-4",
          student_id: studentId,
          status: "resubmit_required",
          submitted_at: "2099-01-04T09:00:00.000Z"
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
          course_id: "course-2",
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
  test("logs view missing and falls back when the student dashboard view is missing", async ({ page }) => {
    const consoleMessages = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) consoleMessages.push(message.text());
    });

    const fixture = makeStudentFixture();
    fixture.missingViews = ["v_student_dashboard"];
    await installSupabaseStub(page, fixture);
    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });

    await expect.poll(() => consoleMessages.join("\n")).toContain("[LMS] View missing: v_student_dashboard.");
    await expect(page.locator("#statCoursesEnrolled")).toHaveText("3");
  });

  test("falls back to direct student stats when dashboard view has no row", async ({ page }) => {
    const consoleMessages = [];
    page.on("console", (message) => {
      if (message.type() === "warning") consoleMessages.push(message.text());
    });

    const fixture = makeStudentFixture();
    fixture.tableData.v_student_dashboard = [];
    await installSupabaseStub(page, fixture);
    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });

    await expect.poll(() => consoleMessages.join("\n")).toContain("[STATS] No row in v_student_dashboard for this student. Using direct count.");
    await expect(page.locator("#statCoursesEnrolled")).toHaveText("3");
    await expect(page.locator("#statPendingAssignments")).toHaveText("2");
  });

  test("refreshes profile form when returning to profile section", async ({ page }) => {
    test.setTimeout(60000);
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
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

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
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

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
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

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
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

  test("shows all courses with signed thumbnails and creator IDs, including courses not yet enrolled", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
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
    await expect(
      page.locator("#courseGrid .sd-course-card", { hasText: "Aged Care Basics" }).locator(".sd-course-card__thumb img")
    ).toHaveAttribute("src", "https://example.com/signed/course-materials/courses/thumbnails/aged-care-basics.png");
    await expect(
      page.locator("#courseGrid .sd-course-card", { hasText: "Aged Care Basics" }).locator(".sd-course-card__thumb")
    ).toHaveCSS("overflow", "hidden");
    await expect(
      page.locator("#courseGrid .sd-course-card", { hasText: "Aged Care Basics" }).locator(".sd-course-card__thumb img")
    ).toHaveCSS("object-fit", "cover");
    await expect(
      page.locator("#courseGrid .sd-course-card", { hasText: "Aged Care Basics" }).locator(".sd-course-card__thumb img")
    ).toHaveCSS("height", "140px");
  });

  test("course stat falls back to all visible courses when dashboard view is stale", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.v_student_dashboard[0].courses_enrolled = 0;
    fixture.tableData.v_student_dashboard[0].pending_submissions = 0;
    fixture.tableData.enrollments[0].status = "paid";
    fixture.tableData.course_progress = fixture.tableData.course_progress.filter((row) => row.course_id !== "course-1");
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#statCoursesEnrolled")).toHaveText("3");
    await expect(page.locator("#statPendingAssignments")).toHaveText("2");
    await expect(page.locator("#continueLearningContent")).toContainText("Aged Care Basics");
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb img")).toHaveAttribute(
      "src",
      "https://example.com/signed/course-materials/courses/thumbnails/aged-care-basics.png"
    );
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb")).toHaveCSS("overflow", "hidden");
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb")).toHaveCSS("width", "104px");
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb")).toHaveCSS("height", "86px");
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb img")).toHaveCSS("object-fit", "cover");
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb img")).toHaveCSS("width", "104px");
    await expect(page.locator("#continueLearningContent .sd-continue-item__thumb img")).toHaveCSS("height", "86px");
  });

  test("keeps half-complete enrolled courses active and hides certificate count until certificate logic ships", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.v_student_dashboard[0].courses_enrolled = 0;
    fixture.tableData.v_student_dashboard[0].certificates_earned = 1;
    fixture.tableData.enrollments[0].status = "completed";
    fixture.tableData.course_progress = fixture.tableData.course_progress.map((row) =>
      row.course_id === "course-1"
        ? { ...row, completion_percent: 50 }
        : row
    );
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#statCoursesEnrolled")).toHaveText("3");
    await expect(page.locator("#statCertificates")).toHaveText("0");

    await page.locator(".sd-nav__item[data-section='courses']").click();
    const activeCourse = page.locator("#courseGrid .sd-course-card", { hasText: "Aged Care Basics" });
    await expect(activeCourse).toHaveAttribute("data-status", "active");
    await expect(activeCourse).toContainText(/50% (Progress|Progres)/);
  });

  test("shows batch material courses in My Courses when their materials appear in Resources", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.profiles[0].batch = "2026";
    fixture.tableData.enrollments.push({
      id: "enroll-draft",
      student_id: "student-1",
      course_id: "course-draft",
      status: "active"
    });
    fixture.tableData.course_progress.push({
      id: "course-progress-draft",
      student_id: "student-1",
      course_id: "course-draft",
      completion_percent: 50
    });
    fixture.tableData.courses.push({
      id: "course-draft",
      title: "Enrolled Resource Course",
      status: "draft",
      thumbnail_url: "",
      category_id: "aged-care",
      trainer_id: "trainer-1",
      profiles: { admin_id: "TR-001" },
      categories: { id: "aged-care", name: "Aged Care" }
    });
    fixture.tableData.lessons.push({
      id: "lesson-draft-resource",
      course_id: "course-draft",
      title: "Draft Course Material",
      material_type: "pdf",
      material_url: "https://example.com/draft-course.pdf",
      material_path: "",
      lesson_order: 1,
      courses: { id: "course-draft", title: "Enrolled Resource Course", enrollment_type: "paid" }
    });
    fixture.tableData.courses.push({
      id: "course-batch-admin",
      title: "Admin Batch Material Course",
      status: "draft",
      thumbnail_url: "",
      category_id: "aged-care",
      trainer_id: "admin-1",
      profiles: { admin_id: "ADM-001" },
      categories: { id: "aged-care", name: "Aged Care" }
    });
    fixture.tableData.lessons.push({
      id: "lesson-batch-admin-resource",
      course_id: "course-batch-admin",
      title: "Admin Batch 2026 Material",
      material_type: "pdf",
      material_url: "https://example.com/admin-batch-2026.pdf",
      material_path: "",
      lesson_order: 1,
      courses: { id: "course-batch-admin", title: "Admin Batch Material Course", enrollment_type: "paid" }
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='resources']").click();
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Draft Course Material" })).toBeVisible();
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Admin Batch 2026 Material" })).toBeVisible();

    await page.locator(".sd-nav__item[data-section='courses']").click();
    const courseCard = page.locator("#courseGrid .sd-course-card", { hasText: "Enrolled Resource Course" });
    await expect(courseCard).toBeVisible();
    await expect(courseCard).toHaveAttribute("data-status", "active");
    const adminBatchCourse = page.locator("#courseGrid .sd-course-card", { hasText: "Admin Batch Material Course" });
    await expect(adminBatchCourse).toBeVisible();
    await expect(adminBatchCourse).toHaveAttribute("data-status", "active");
  });

  test("shows competency separately from course progress", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#competencySummaryContent")).toContainText("Aged Care Basics");
    await expect(page.locator("#competencySummaryContent")).toContainText("Not Yet Competent (NYC)");
    await expect(page.locator("#competencySummaryContent")).toContainText("Assessment Progress: 0/2");
    await expect(page.locator("#competencySummaryContent")).toContainText("First Aid Essentials");
    await expect(page.locator("#competencySummaryContent")).toContainText("Competent (C)");

    await page.locator(".sd-nav__item[data-section='courses']").click();
    await expect(page.locator("#courseGrid .sd-course-card", { hasText: "First Aid Essentials" })).toContainText(/100% (Progress|Progres)/);
  });

  test("realtime notification refreshes student stats and active course grid", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#statCoursesEnrolled")).toHaveText("3");
    await page.locator(".sd-nav__item[data-section='courses']").click();
    await expect(page.locator("#courseGrid .sd-course-card")).toHaveCount(3);
    await expect(page.locator("#courseGrid")).not.toContainText("Realtime Care");

    const triggered = await page.evaluate(async () => {
      const rows = window.__QA_TABLE_DATA__;
      rows.v_student_dashboard[0].courses_enrolled = 3;
      rows.enrollments.push({
        id: "enroll-realtime",
        student_id: "student-1",
        course_id: "course-realtime",
        status: "active"
      });
      rows.courses.push({
        id: "course-realtime",
        title: "Realtime Care",
        status: "published",
        thumbnail_url: "",
        category_id: "aged-care",
        trainer_id: "trainer-1",
        profiles: { admin_id: "TR-001" },
        categories: { id: "aged-care", name: "Aged Care" }
      });
      return window.__QA_TRIGGER_CHANNEL("student-assignment-notif", "notifications", "INSERT");
    });

    expect(triggered).toBe(1);
    await expect(page.locator("#statCoursesEnrolled")).toHaveText("4");
    await expect(page.locator("#courseGrid")).toContainText("Realtime Care");
  });

  test("opens student course contents from the course card", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='courses']").click();
    const courseCard = page.locator("#courseGrid .sd-course-card", { hasText: "Aged Care Basics" });
    await expect(courseCard).toBeVisible();
    await courseCard.click();

    await expect(page.locator("#studentCourseDetail")).toBeVisible();
    await expect(page.locator("#studentCourseDetail")).toContainText("Aged Care Basics");
    await expect(page.locator("#studentCourseDetail .sd-course-detail__module")).toHaveCount(1);
    await expect(page.locator("#studentCourseDetail .sd-course-detail__lesson")).toHaveCount(2);
    await expect(page.locator("#studentCourseDetail")).toContainText("Safe Transfers Video");
    await expect(page.locator("#studentCourseDetail")).toContainText("Care Plan Notes");
    await expect(page.locator("#studentCourseDetail a", { hasText: "Open material" })).toHaveAttribute("href", "https://example.com/signed/course-materials/courses/course-1/module-1/safe-transfers.mp4");
  });

  test("updates course progress when the lesson viewer marks a lesson complete", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.assignment_submissions.push(
      {
        id: "sub-duplicate-pass-1",
        assignment_id: "assign-1",
        student_id: "student-1",
        status: "graded",
        submitted_at: "2026-03-10T09:00:00.000Z",
        grade: 85,
        notes: "",
        file_urls: []
      },
      {
        id: "sub-duplicate-pass-2",
        assignment_id: "assign-1",
        student_id: "student-1",
        status: "graded",
        submitted_at: "2026-03-10T10:00:00.000Z",
        grade: 90,
        notes: "",
        file_urls: []
      }
    );
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#continueLearningContent")).toContainText("Aged Care Basics");

    await page.evaluate(async () => {
      await window.lmsMarkLessonCompleted("lesson-2", "course-1");
    });

    const progressState = await page.evaluate(() => {
      const rows = window.__QA_TABLE_DATA__;
      return {
        lessonProgress: rows.progress.find((row) =>
          row.student_id === "student-1" && row.lesson_id === "lesson-2"
        ),
        courseProgress: rows.course_progress.find((row) =>
          row.student_id === "student-1" && row.course_id === "course-1"
        ),
        rpcInvocations: window.__QA_RPC_INVOCATIONS__,
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
      completed: true
    }));
    expect(progressState.courseProgress).toEqual(expect.objectContaining({
      completion_percent: 75,
      last_lesson_id: "lesson-2"
    }));
    expect(progressState.rpcInvocations).toEqual(expect.arrayContaining([
      {
        name: "recalculate_course_progress",
        params: {
          p_student_id: "student-1",
          p_course_id: "course-1",
          p_last_lesson_id: "lesson-2"
        }
      }
    ]));
    expect(progressState.activityLog).toEqual(expect.objectContaining({
      user_id: "student-1",
      action: "lesson_completed",
      entity_type: "lesson",
      entity_id: "lesson-2",
      metadata: expect.objectContaining({ course_id: "course-1", lesson_id: "lesson-2" })
    }));
    expect(progressState.certificate).toBeUndefined();
  });

  test("creates course progress when lesson completion has no existing row", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.enrollments.push({ id: "enroll-3", student_id: "student-1", course_id: "course-3", status: "active" });
    fixture.tableData.lessons.push({
      id: "lesson-4",
      course_id: "course-3",
      title: "New Course Intro",
      material_type: "text",
      material_url: null,
      lesson_order: 1
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#sidebarName")).toHaveText("Alpha Student");
    await page.evaluate(async () => {
      await window.lmsMarkLessonCompleted("lesson-4", "course-3");
    });

    const progressResult = await page.evaluate(() => {
      const rows = window.__QA_TABLE_DATA__;
      return {
        courseProgress: rows.course_progress.find((row) =>
          row.student_id === "student-1" && row.course_id === "course-3"
        ),
        rpcInvocations: window.__QA_RPC_INVOCATIONS__
      };
    });

    expect(progressResult.courseProgress).toEqual(expect.objectContaining({
      student_id: "student-1",
      course_id: "course-3",
      enrollment_id: "enroll-3",
      completion_percent: 50,
      last_lesson_id: "lesson-4"
    }));
    expect(progressResult.rpcInvocations).toEqual(expect.arrayContaining([
      {
        name: "recalculate_course_progress",
        params: {
          p_student_id: "student-1",
          p_course_id: "course-3",
          p_last_lesson_id: "lesson-4"
        }
      }
    ]));
  });

  test("loads assignments from enrolled courses and maps submission status", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.enrollments[0].status = "paid";
    fixture.tableData.assignments.push({
      id: "assign-new-no-submission",
      course_id: "course-1",
      title: "Trainer New Assignment",
      type: "assignment",
      course_title: "Aged Care Basics",
      due_at: "2099-01-09"
    });
    fixture.tableData.assignments.push({
      id: "assign-draft-hidden",
      course_id: "course-1",
      title: "Draft Hidden Assignment",
      type: "assignment",
      course_title: "Aged Care Basics",
      due_at: "2099-01-10",
      is_published: false
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='assignments']").click();

    await expect(page.locator("#assignmentList .sd-assignment-item")).toHaveCount(4);
    await expect(page.locator("#assignmentList")).toContainText("Module 1 Quiz");
    await expect(page.locator("#assignmentList")).toContainText("Final Assignment");
    await expect(page.locator("#assignmentList")).toContainText("Care Plan Rewrite");
    await expect(page.locator("#assignmentList")).toContainText("Trainer New Assignment");
    await expect(page.locator("#assignmentList")).not.toContainText("Draft Hidden Assignment");
    await expect(page.locator("#assignmentList")).not.toContainText("Unenrolled Course Quiz");
    await expect(page.locator(".sd-assignment-item[data-status='pending']")).toHaveCount(2);

    await page.locator(".sd-filter-tab[data-filter='graded']").click();
    await expect(page.locator(".sd-assignment-item[data-status='graded']")).toBeVisible();
    await expect(page.locator(".sd-assignment-item[data-status='graded']")).toContainText("Final Assignment");
    await expect(page.locator(".sd-assignment-item[data-status='graded']")).toContainText(/88%.*LULUS/);
    await expect(page.locator(".sd-assignment-item[data-status='graded']")).toContainText("Strong practical reasoning.");

    const resubmitItem = page.locator(".sd-assignment-item[data-status='resubmit_required']");
    await expect(resubmitItem).toHaveCount(1);
    await expect(resubmitItem).toContainText("Trainer meminta kamu mengumpulkan ulang tugas ini.");
    await expect(resubmitItem).toContainText("Kumpulkan Ulang");
    await expect(resubmitItem.locator("input[type='file']")).toHaveAttribute("accept", /video\/\*/);
  });

  test("switches schedule view from list to calendar using real dashboard controls", async ({ page }) => {
    // This test covers the list/calendar schedule toggle, which existing tests do not exercise.
    const fixture = makeStudentFixture();
    fixture.tableData.enrollments[0].status = "completed";
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='schedule']").click();

    await expect(page.locator("#scheduleFullList .sd-schedule-event-card")).toHaveCount(2);
    await expect(page.locator("#scheduleFullList .sd-schedule-event-card", { hasText: "Live Session" })).toContainText("January 2099");
    await expect(page.locator("#scheduleFullList a", { hasText: "Join" })).toHaveCount(1);

    await page.click(".sd-view-btn[data-view='calendar']");

    await expect(page.locator(".sd-view-btn[data-view='calendar']")).toHaveClass(/active/);
    await expect(page.locator("#scheduleFullList .sd-schedule-event-card")).toHaveCount(0);
    await expect(page.locator(".sd-schedule-calendar__title")).toHaveText("January 2099");
    await expect(page.locator(".sd-schedule-calendar__weekday.is-sunday")).toHaveText("Sun");
    await expect(page.locator(".sd-schedule-calendar__cell.is-sunday").first()).toBeVisible();
    await expect(page.locator(".sd-schedule-calendar")).toContainText("Sun, Jan 2099");
    await expect(page.locator(".sd-schedule-calendar__event--live", { hasText: "Live Session" })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const calendarFitsMobile = await page.locator(".sd-schedule-calendar").evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
    expect(calendarFitsMobile).toBe(true);

    await page.locator("[data-schedule-month='next']").click();
    await expect(page.locator(".sd-schedule-calendar__title")).toHaveText("February 2099");
    await page.locator("[data-schedule-month='prev']").click();
    await expect(page.locator(".sd-schedule-calendar__title")).toHaveText("January 2099");
  });

  test("warns when a student has no enrolled courses for assignments", async ({ page }) => {
    const consoleMessages = [];
    page.on("console", (message) => {
      if (message.type() === "warning") consoleMessages.push(message.text());
    });

    const fixture = makeStudentFixture();
    fixture.tableData.enrollments = [];
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='assignments']").click();

    await expect.poll(() => consoleMessages.join("\n")).toContain("[ENROLLMENT] courseIds kosong untuk userId:");
    await expect.poll(() => consoleMessages.join("\n")).toContain("[ASSIGNMENTS] No enrolled courses found. Trainer-created assignments won't show.");
    await expect(page.locator("#assignmentEmpty")).toBeVisible();
  });

  test("shows trainer-wide schedule events for enrolled students", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.schedules.push({
      id: "schedule-trainer-wide",
      title: "Trainer-wide briefing",
      event_type: "live_session",
      start_datetime: "2099-01-09T09:00:00.000Z",
      end_datetime: "2099-01-09T10:00:00.000Z",
      meeting_url: "",
      course_id: null,
      trainer_id: "trainer-1"
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='schedule']").click();

    await expect(page.locator("#scheduleFullList")).toContainText("Trainer-wide briefing");
  });

  test("shows global admin schedule events for students", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.schedules.push({
      id: "schedule-admin-global",
      title: "All-student admin briefing",
      event_type: "live_session",
      start_datetime: "2099-01-11T09:00:00.000Z",
      end_datetime: "2099-01-11T10:00:00.000Z",
      meeting_url: "",
      course_id: null,
      trainer_id: "admin-1"
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='schedule']").click();

    await expect(page.locator("#scheduleFullList")).toContainText("All-student admin briefing");
  });

  test("shows global schedule events even when enrolled course ids are empty", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.enrollments = [];
    fixture.tableData.schedules.push({
      id: "schedule-global-no-enrollment",
      title: "Global no-enrollment briefing",
      event_type: "live_session",
      start_datetime: "2099-01-13T09:00:00.000Z",
      end_datetime: "2099-01-13T10:00:00.000Z",
      meeting_url: "",
      course_id: null,
      trainer_id: "admin-1"
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='schedule']").click();

    await expect(page.locator("#scheduleFullList")).toContainText("Global no-enrollment briefing");
  });

  test("filters lesson material resource cards by material type and search text", async ({ page }) => {
    // This test covers enrolled lesson materials, material-type tabs, and search together.
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='resources']").click();

    await expect(page.locator("#resourceGrid [data-resource-card='true']")).toHaveCount(2);

    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Care Plan Notes" })).toHaveCount(0);

    await page.click("#resourceCategoryTabs .sd-filter-tab[data-category='video']");
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Safe Transfers Video" })).toBeVisible();
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "First Aid PDF" })).toBeHidden();
    await expect(page.locator("#resourceGrid [data-resource-card='true'] a", { hasText: "Open" })).toHaveAttribute("href", "https://example.com/signed/course-materials/courses/course-1/module-1/safe-transfers.mp4");

    await page.click("#resourceCategoryTabs .sd-filter-tab[data-category='all']");
    await page.fill("#resourceSearch", "first aid");
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "First Aid PDF" })).toBeVisible();
    await expect(page.locator("#resourceGrid [data-resource-card='true']", { hasText: "Safe Transfers Video" })).toBeHidden();
    await expect(page.locator("#resourceGrid [data-resource-card='true'] a", { hasText: "Download" })).toHaveAttribute("href", "https://example.com/first-aid.pdf");
  });

  test("marks notifications and messages read from the student indicators", async ({ page }) => {
    // This test covers the notification panel action and verifies message unread state keeps the bell on until read.
    const fixture = makeStudentFixture();
    fixture.tableData.messages.push({
      id: "msg-student-reply",
      sender_id: "student-1",
      recipient_id: "trainer-1",
      subject: "Re: Welcome",
      body: "Thanks for the update.",
      is_read: true,
      is_archived: false,
      created_at: "2099-01-01T09:05:00.000Z"
    });
    fixture.tableData.messages.push({
      id: "msg-student-followup",
      sender_id: "trainer-1",
      recipient_id: "student-1",
      subject: "Re: Welcome",
      body: "Following up on module one.",
      is_read: true,
      is_archived: false,
      created_at: "2099-01-01T09:10:00.000Z"
    });
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#notifDot")).toBeVisible();
    await expect(page.locator("#messageBadge")).toHaveText("1");

    await page.click("#sdNotifBtn");
    await expect(page.locator(".sd-notif-list-item.unread")).toHaveCount(3);
    await expect(page.locator("#notifList")).toContainText("Welcome");
    await expect(page.locator("#notifList")).toContainText("Please review module one.");
    await page.click("#markAllRead");

    await expect(page.locator("#notifPanel")).toBeHidden();
    await expect(page.locator("#messageBadge")).toBeHidden();
    await expect(page.locator("#notifDot")).toBeHidden();
    await expect(page.locator(".sd-notif-list-item.unread")).toHaveCount(0);

    const unread = await page.evaluate(() =>
      window.__QA_TABLE_DATA__.notifications.filter((row) => !row.is_read).length
    );
    expect(unread).toBe(0);

    const messages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
    expect(messages.find((msg) => msg.id === "msg-1")).toEqual(expect.objectContaining({
      is_read: true,
      recipient_id: "student-1"
    }));

    await page.locator(".sd-nav__item[data-section='messages']").click();
    await expect(page.locator("#studentMsgComposeForm")).toBeHidden();
    await expect(page.locator("#messageViewEmpty")).toBeVisible();
    const welcomeMessage = page.locator(".sd-inbox-item", { hasText: "Welcome" });
    await expect(welcomeMessage).toHaveCount(1);
    await expect(welcomeMessage).toContainText("Following up on module one.");
    await expect(welcomeMessage).toHaveAttribute("role", "button");
    await expect(welcomeMessage).toHaveAttribute("tabindex", "0");
    await welcomeMessage.focus();
    await page.keyboard.press("Enter");
    await expect(welcomeMessage).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#messageDetail")).toContainText("Please review module one.");
    await expect(page.locator("#messageDetail")).toContainText("Thanks for the update.");
    await expect(page.locator("#messageDetail")).toContainText("Following up on module one.");
    await expect(page.locator("#sdMsgThread .sd-thread-msg")).toHaveCount(3);
    await expectFirstThreadMessageFullyVisible(page, "#sdMsgThread", ".sd-thread-msg");
    await expectRightPanelWheelScrolls(page, "#messageDetail");
    await expect(page.locator("#messageDetail")).toContainText("Reply");
    await expect(page.locator("#messageDetail")).toContainText("Archive");
    await expect(page.locator("#messageDetail")).toContainText("Delete");

    await page.locator("[data-sd-msg-reply]").click();
    await expect(page.locator("#studentMsgComposeForm")).toBeVisible();
    await expect(page.locator("#studentMsgSubject")).toHaveValue("Re: Welcome");
    await expect(page.locator("#studentMsgRecipient")).toHaveValues(["trainer-1"]);
    await expect(page.locator("#studentMsgBody")).toBeFocused();
    await page.locator("#studentMsgBody").fill("I reviewed it from the thread.");
    await page.locator("#studentSendMsgBtn").click();
    await expect(page.locator("#studentMsgComposeForm")).toBeHidden();
    await expect(page.locator("[data-student-message-view='inbox']")).toHaveClass(/active/);
    await expect(page.locator("#messageDetail")).toContainText("I reviewed it from the thread.");
    await expect(page.locator("#sdMsgThread .sd-thread-msg")).toHaveCount(4);
    await expectLastThreadMessageFullyVisible(page, "#sdMsgThread", ".sd-thread-msg");

    await page.locator(".sd-inbox-item", { hasText: "Welcome" }).click();
    await page.locator("[data-sd-msg-archive]").click();
    await expect.poll(async () => {
      const messages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
      return messages.find((msg) => msg.id === "msg-1")?.is_archived;
    }).toBe(true);
    await expect(page.locator(".sd-inbox-item", { hasText: "Welcome" })).toHaveCount(0);
    await page.locator("[data-student-message-view='archive']").click();
    await expect(page.locator(".sd-inbox-item", { hasText: "Welcome" })).toHaveCount(1);
    await page.locator(".sd-inbox-item", { hasText: "Welcome" }).click();
    await expect(page.locator("#messageDetail")).toContainText("Restore");
    await page.locator("[data-sd-msg-restore]").click();
    await expect.poll(async () => {
      const messages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
      return messages.find((msg) => msg.id === "msg-1")?.is_archived;
    }).toBeFalsy();

    await page.locator("[data-student-message-view='inbox']").click();
    await page.locator(".sd-inbox-item", { hasText: "Welcome" }).click();
    await page.locator("[data-sd-msg-delete-inbox]").click();
    await page.locator("#sdConfirmOk").click();
    const afterDelete = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
    expect(afterDelete.some((msg) => msg.id === "msg-1")).toBe(false);
    expect(afterDelete.some((msg) => msg.id === "msg-student-followup")).toBe(false);
    expect(afterDelete.some((msg) => msg.body === "I reviewed it from the thread.")).toBe(false);
  });

  test("reply uses the original sender name when the profile lookup is not returned", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.profiles = fixture.tableData.profiles.filter((profile) => profile.id !== "trainer-1");
    fixture.tableData.messages = fixture.tableData.messages.map((message) =>
      message.sender_id === "trainer-1"
        ? { ...message, profiles: null, sender_profile: { id: "trainer-1", full_name: "Trainer One", email: "trainer@example.com" } }
        : message
    );
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html", { waitUntil: "domcontentloaded" });
    await page.locator(".sd-nav__item[data-section='messages']").click();
    await page.locator(".sd-inbox-item", { hasText: "Welcome" }).click();

    await expect(page.locator("#messageDetail")).toContainText("From: Trainer One");
    await page.locator("[data-sd-msg-reply]").click();
    await expect(page.locator("#studentMsgRecipient")).toHaveValues(["trainer-1"]);
    await expect(page.locator("#studentMsgRecipient option:checked")).toHaveText("Trainer One");
  });

  test("renders the full thread when older messages are outside the global message pool", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.messages = fixture.tableData.messages.map((message) =>
      message.id === "msg-1" ? { ...message, is_read: true } : message
    );
    fixture.tableData.messages.push({
      id: "msg-old-thread-reply",
      sender_id: "student-1",
      recipient_id: "trainer-1",
      subject: "Re: Welcome",
      body: "This is the middle reply.",
      is_read: true,
      is_archived: false,
      created_at: "2099-01-01T09:05:00.000Z"
    });
    fixture.tableData.messages.push({
      id: "msg-old-thread-followup",
      sender_id: "trainer-1",
      recipient_id: "student-1",
      subject: "Re: Welcome",
      body: "This is the latest visible reply.",
      is_read: true,
      is_archived: false,
      created_at: "2099-01-01T09:10:00.000Z"
    });
    fixture.tableData.messages.push(...Array.from({ length: 98 }, (_, index) => ({
      id: `msg-noise-${index + 1}`,
      sender_id: "admin-1",
      recipient_id: "student-1",
      subject: `Announcement ${index + 1}`,
      body: `Noise message ${index + 1}`,
      is_read: true,
      is_archived: false,
      created_at: `2099-01-03T${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}:00.000Z`
    })));
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.locator(".sd-nav__item[data-section='messages']").click();

    const welcomeMessage = page.locator(".sd-inbox-item", { hasText: "Welcome" });
    await expect(welcomeMessage).toHaveCount(1);
    await expect(welcomeMessage).toContainText("This is the latest visible reply.");
    await welcomeMessage.click();

    await expect(page.locator("#messageDetail")).toContainText("Please review module one.");
    await expect(page.locator("#messageDetail")).toContainText("This is the middle reply.");
    await expect(page.locator("#messageDetail")).toContainText("This is the latest visible reply.");
    await expect(page.locator("#sdMsgThread .sd-thread-msg")).toHaveCount(3);
  });

  test("message notification opens the selected student message", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.click("#sdNotifBtn");
    await page.locator(".sd-notif-list-item", { hasText: "Welcome" }).click();

    await expect(page.locator("#section-messages")).toHaveClass(/active/);
    await expect(page.locator(".sd-inbox-item.active", { hasText: "Welcome" })).toBeVisible();
    await expect(page.locator("#messageDetail")).toBeVisible();
    await expect(page.locator("#messageDetail")).toContainText("Please review module one.");

    const messages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
    expect(messages.find((msg) => msg.id === "msg-1")).toEqual(expect.objectContaining({
      is_read: true,
      recipient_id: "student-1"
    }));
  });

  test("assignment notification opens assignments and marks the notification read", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await page.click("#sdNotifBtn");
    await page.locator(".sd-notif-list-item", { hasText: "Assignment graded" }).click();

    await expect(page.locator("#notifPanel")).toBeHidden();
    await expect(page.locator("#section-assignments")).toHaveClass(/active/);

    const notification = await page.evaluate(() =>
      window.__QA_TABLE_DATA__.notifications.find((row) => row.id === "notif-2")
    );
    expect(notification).toEqual(expect.objectContaining({
      is_read: true,
      read_at: expect.any(String)
    }));
  });

  test("realtime message refreshes student indicators and home stats", async ({ page }) => {
    const fixture = makeStudentFixture();
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#messageBadge")).toHaveText("1");
    await expect(page.locator("#statPendingAssignments")).toHaveText("2");

    const triggered = await page.evaluate(async () => {
      const rows = window.__QA_TABLE_DATA__;
      rows.v_student_dashboard[0].pending_submissions = 2;
      rows.messages.push({
        id: "msg-realtime",
        sender_id: "trainer-1",
        recipient_id: "student-1",
        subject: "Realtime message",
        body: "New unread message.",
        is_read: false,
        created_at: "2099-01-07T08:00:00.000Z",
        profiles: { full_name: "Trainer One", avatar_url: null }
      });
      return window.__QA_TRIGGER_CHANNEL("student-message-channel", "messages", "INSERT");
    });

    expect(triggered).toBe(1);
    await expect(page.locator("#messageBadge")).toHaveText("2");
    await expect(page.locator("#statPendingAssignments")).toHaveText("2");
  });

  test("archived unread messages do not keep student indicators active", async ({ page }) => {
    const fixture = makeStudentFixture();
    fixture.tableData.notifications = [];
    fixture.tableData.messages = fixture.tableData.messages.map((message) =>
      message.id === "msg-1"
        ? { ...message, is_archived: true }
        : message
    );
    await installSupabaseStub(page, fixture);

    await page.goto("/pages/dashboard-student.html");
    await expect(page.locator("#messageBadge")).toBeHidden();
    await expect(page.locator("#notifDot")).toBeHidden();

    await page.click("#sdNotifBtn");
    await expect(page.locator("#notifList")).not.toContainText("Welcome");

    await page.locator(".sd-nav__item[data-section='messages']").click();
    await expect(page.locator(".sd-inbox-item", { hasText: "Welcome" })).toHaveCount(0);
    await page.locator("[data-student-message-view='archive']").click();
    await expect(page.locator(".sd-inbox-item", { hasText: "Welcome" })).toHaveCount(1);
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
    const notificationInvocations = await page.evaluate(() => window.__QA_FUNCTION_INVOCATIONS__);
    expect(notificationInvocations).toEqual(expect.arrayContaining([
      {
        name: "send-lms-notification",
        body: { message_ids: sentMessagesForRecipients.map((message) => message.id), notification_ids: [] }
      }
    ]));
    await page.locator("[data-student-message-view='history']").click();
    await expect(page.locator(".sd-inbox-item", { hasText: "Question about Module 1" })).toHaveCount(1);
    await page.locator(".sd-inbox-item", { hasText: "Question about Module 1" }).click();
    await expect(page.locator("#messageDetail")).toContainText("Sent to 2 recipients");
    await expect(page.locator("#messageDetail")).toContainText("Trainer One");
    await expect(page.locator("#messageDetail")).toContainText("Admin One");
    await page.locator("[data-sd-msg-archive]").click();
    await expect.poll(async () => {
      const messages = await page.evaluate(() => window.__QA_TABLE_DATA__.messages);
      return messages
        .filter((msg) => msg.sender_id === "student-1" && msg.subject === "Question about Module 1")
        .every((msg) => msg.is_archived === true);
    }).toBe(true);
    await expect(page.locator(".sd-inbox-item", { hasText: "Question about Module 1" })).toHaveCount(0);
    await page.locator("[data-student-message-view='archive']").click();
    await expect(page.locator(".sd-inbox-item", { hasText: "Question about Module 1" })).toHaveCount(1);
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
