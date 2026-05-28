const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readSql(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("Supabase security advisor SQL contract", () => {
  const lmsSetupSql = readSql("SUPABASE_LMS_SETUP.sql");
  const securityAdvisorSql = readSql("SUPABASE_SECURITY_ADVISOR_FIX.sql");
  const sql = [lmsSetupSql, securityAdvisorSql].join("\n");

  test("public storage buckets do not allow broad object listing", () => {
    expect(sql).not.toMatch(/create\s+policy\s+"avatars_public_read"[\s\S]*?for\s+select[\s\S]*?to\s+public/i);
    expect(sql).not.toMatch(/create\s+policy\s+"assignment_submissions_public_read"[\s\S]*?for\s+select[\s\S]*?to\s+public/i);

    expect(securityAdvisorSql).toMatch(/create\s+policy\s+"avatars_read"[\s\S]*?to\s+authenticated[\s\S]*?name\s+like\s+\(\(select\s+auth\.uid\(\)\)::text\s+\|\|\s+'\.%'\)[\s\S]*?name\s+like\s+\('avatars\/'\s+\|\|\s+\(select\s+auth\.uid\(\)\)::text\s+\|\|\s+'\.%'\)[\s\S]*?private\.is_staff/i);
    expect(securityAdvisorSql).toMatch(/create\s+policy\s+"assignment_submissions_read"[\s\S]*?to\s+authenticated[\s\S]*?\(storage\.foldername\(name\)\)\[1\]\s+=\s+\(select\s+auth\.uid\(\)\)::text[\s\S]*?private\.is_staff/i);
  });

  test("security-definer role helpers are not exposed from the public schema", () => {
    expect(sql).not.toMatch(/create\s+or\s+replace\s+function\s+public\.is_(admin|staff)\s*\(/i);
    expect(sql).not.toMatch(/grant\s+execute\s+on\s+function\s+public\.is_(admin|staff)\s*\(\s*uuid\s*\)\s+to\s+authenticated/i);

    expect(sql).toMatch(/create\s+or\s+replace\s+function\s+private\.is_admin\s*\(/i);
    expect(sql).toMatch(/create\s+or\s+replace\s+function\s+private\.is_staff\s*\(/i);
  });

  test("role-helper policies are recreated against the private schema", () => {
    const createdPolicies = securityAdvisorSql.match(/create\s+policy[\s\S]*?;/gi).join("\n");
    const withoutPrivateHelpers = createdPolicies.replace(/private\.is_(admin|staff)\s*\(/gi, "");

    expect(withoutPrivateHelpers).not.toMatch(/\bis_(admin|staff)\s*\(/i);
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"lms_insert_staff_courses"\s+on\s+public\.courses/i);
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"lms_update_staff_announcements"\s+on\s+public\.announcements/i);
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"lms_delete_staff_lessons"\s+on\s+public\.lessons/i);
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"lms_insert_own_progress"\s+on\s+public\.progress/i);
  });

  test("recreated RLS policies use init-plan auth.uid calls", () => {
    const createdPolicies = securityAdvisorSql.match(/create\s+policy[\s\S]*?;/gi).join("\n");
    const withoutInitPlanUid = createdPolicies.replace(/\(select\s+auth\.uid\(\)\)/gi, "");

    expect(withoutInitPlanUid).not.toMatch(/auth\.uid\(\)/i);
  });

  test("obsolete overlapping live policies are removed", () => {
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"student_read_enrolled_assignments"\s+on\s+public\.assignments/i);
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"trainer_manage_own_assignments"\s+on\s+public\.assignments/i);
    expect(securityAdvisorSql).toMatch(/drop\s+policy\s+if\s+exists\s+"messages_archive_own"\s+on\s+public\.messages/i);
  });
});
