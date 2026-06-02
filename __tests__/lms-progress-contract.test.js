const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readSql(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("LMS progress SQL contract", () => {
  const progressSql = readSql("SUPABASE_PROGRESS_CONSTRAINTS_RLS_FIX.sql");
  const productionSql = readSql("SUPABASE_COURSE_PROGRESS_RPC_PRODUCTION.sql");
  const lmsSetupSql = readSql("SUPABASE_LMS_SETUP.sql");

  test("progress migration adds stable uniqueness for progress aggregates", () => {
    expect(progressSql).toMatch(/progress_student_lesson_unique\s+unique\s*\(\s*student_id\s*,\s*lesson_id\s*\)/i);
    expect(progressSql).toMatch(/course_progress_student_course_unique\s+unique\s*\(\s*student_id\s*,\s*course_id\s*\)/i);
    expect(progressSql).toMatch(/public\.progress[\s\S]*?null\s+student_id\s+or\s+lesson_id/i);
    expect(progressSql).toMatch(/public\.course_progress[\s\S]*?duplicate\s+student_id\s+\+\s+course_id/i);
  });

  test("progress migration includes preflight duplicate/null checks", () => {
    expect(progressSql).toMatch(/PREFLIGHT/i);
    expect(progressSql).toMatch(/progress_null_student_or_lesson/i);
    expect(progressSql).toMatch(/progress_duplicate_student_lesson/i);
    expect(progressSql).toMatch(/course_progress_duplicate_student_course/i);
  });

  test("progress RLS allows own lesson progress and own course aggregate writes", () => {
    expect(progressSql).toMatch(/create\s+policy\s+"lms_write_own_progress"[\s\S]*?on\s+public\.progress[\s\S]*?student_id\s*=\s*\(select\s+auth\.uid\(\)\)[\s\S]*?private\.is_staff/i);
    expect(progressSql).toMatch(/create\s+policy\s+"lms_insert_own_or_staff_course_progress"[\s\S]*?on\s+public\.course_progress[\s\S]*?with\s+check\s*\([\s\S]*?student_id\s*=\s*\(select\s+auth\.uid\(\)\)[\s\S]*?private\.is_staff/i);
    expect(progressSql).toMatch(/create\s+policy\s+"lms_update_own_or_staff_course_progress"[\s\S]*?on\s+public\.course_progress[\s\S]*?student_id\s*=\s*\(select\s+auth\.uid\(\)\)[\s\S]*?private\.is_staff/i);
  });

  test("course_progress student writes are documented as demo/staging only", () => {
    expect(progressSql).toMatch(/acceptable\s+for[\s\S]*demo\/staging[\s\S]*production[\s\S]*server-side/i);
  });

  test("production migration creates a protected course progress RPC", () => {
    expect(productionSql).toMatch(/create\s+or\s+replace\s+function\s+public\.recalculate_course_progress\s*\(\s*p_student_id\s+uuid\s*,\s*p_course_id\s+uuid\s*,\s*p_last_lesson_id\s+uuid\s+default\s+null\s*\)/i);
    expect(productionSql).toMatch(/security\s+definer/i);
    expect(productionSql).toMatch(/set\s+search_path\s*=\s*public\s*,\s*private/i);
    expect(productionSql).toMatch(/if\s+not\s*\(\s*v_uid\s*=\s*p_student_id\s+or\s+private\.is_staff\(v_uid\)\s*\)/i);
    expect(productionSql).toMatch(/count\s*\(\s*distinct\s+p\.lesson_id\s*\)/i);
    expect(productionSql).toMatch(/count\s*\(\s*distinct\s+s\.assignment_id\s*\)/i);
    expect(productionSql).toMatch(/s\.status\s*=\s*'graded'/i);
    expect(productionSql).toMatch(/s\.grade\s*>=\s*coalesce\s*\(\s*a\.pass_mark\s*,\s*70\s*\)/i);
    expect(productionSql).toMatch(/when\s+v_total_units\s*<=\s*0\s+then\s+0/i);
    expect(productionSql).toMatch(/on\s+conflict\s*\(\s*student_id\s*,\s*course_id\s*\)/i);
    expect(productionSql).toMatch(/insert\s+into\s+public\.certificates[\s\S]*?where\s+not\s+exists/i);
    expect(productionSql).toMatch(/revoke\s+all\s+on\s+function\s+public\.recalculate_course_progress\(uuid,\s*uuid,\s*uuid\)\s+from\s+public/i);
    expect(productionSql).toMatch(/grant\s+execute\s+on\s+function\s+public\.recalculate_course_progress\(uuid,\s*uuid,\s*uuid\)\s+to\s+authenticated/i);
  });

  test("production migration keeps direct course_progress writes staff-only", () => {
    expect(productionSql).toMatch(/drop\s+policy\s+if\s+exists\s+"lms_insert_own_or_staff_course_progress"/i);
    expect(productionSql).toMatch(/drop\s+policy\s+if\s+exists\s+"lms_update_own_or_staff_course_progress"/i);
    expect(productionSql).toMatch(/create\s+policy\s+"lms_insert_staff_course_progress"[\s\S]*?on\s+public\.course_progress[\s\S]*?with\s+check\s*\(\s*private\.is_staff/i);
    expect(productionSql).toMatch(/create\s+policy\s+"lms_update_staff_course_progress"[\s\S]*?on\s+public\.course_progress[\s\S]*?using\s*\(\s*private\.is_staff/i);
    expect(productionSql).not.toMatch(/create\s+policy\s+"lms_insert_own_or_staff_course_progress"/i);
    expect(productionSql).not.toMatch(/create\s+policy\s+"lms_update_own_or_staff_course_progress"/i);
  });

  test("production migration keeps lesson-level progress writable by owner", () => {
    expect(productionSql).toMatch(/create\s+policy\s+"lms_insert_own_progress"[\s\S]*?on\s+public\.progress[\s\S]*?with\s+check\s*\([\s\S]*?student_id\s*=\s*\(select\s+auth\.uid\(\)\)[\s\S]*?private\.is_staff/i);
    expect(productionSql).toMatch(/create\s+policy\s+"lms_update_own_progress"[\s\S]*?on\s+public\.progress[\s\S]*?using\s*\([\s\S]*?student_id\s*=\s*\(select\s+auth\.uid\(\)\)[\s\S]*?private\.is_staff/i);
  });

  test("existing staff policies cover grading and enrollment completion writes", () => {
    expect(lmsSetupSql).toMatch(/create\s+policy\s+"lms_write_staff_submissions"[\s\S]*?on\s+public\.assignment_submissions[\s\S]*?for\s+update[\s\S]*?private\.is_staff/i);
    expect(lmsSetupSql).toMatch(/create\s+policy\s+"lms_write_staff_enrollments"[\s\S]*?on\s+public\.enrollments[\s\S]*?for\s+all[\s\S]*?private\.is_staff/i);
  });
});
