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

    expect(securityAdvisorSql).toMatch(/create\s+policy\s+"avatars_read"[\s\S]*?to\s+authenticated[\s\S]*?name\s+like\s+\(auth\.uid\(\)::text\s+\|\|\s+'\.%'\)[\s\S]*?name\s+like\s+\('avatars\/'\s+\|\|\s+auth\.uid\(\)::text\s+\|\|\s+'\.%'\)[\s\S]*?private\.is_staff/i);
    expect(securityAdvisorSql).toMatch(/create\s+policy\s+"assignment_submissions_read"[\s\S]*?to\s+authenticated[\s\S]*?\(storage\.foldername\(name\)\)\[1\]\s+=\s+auth\.uid\(\)::text[\s\S]*?private\.is_staff/i);
  });

  test("security-definer role helpers are not exposed from the public schema", () => {
    expect(sql).not.toMatch(/create\s+or\s+replace\s+function\s+public\.is_(admin|staff)\s*\(/i);
    expect(sql).not.toMatch(/grant\s+execute\s+on\s+function\s+public\.is_(admin|staff)\s*\(\s*uuid\s*\)\s+to\s+authenticated/i);

    expect(sql).toMatch(/create\s+or\s+replace\s+function\s+private\.is_admin\s*\(/i);
    expect(sql).toMatch(/create\s+or\s+replace\s+function\s+private\.is_staff\s*\(/i);
  });
});
