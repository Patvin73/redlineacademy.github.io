const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readFile(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("Supabase query performance SQL contract", () => {
  const performanceSql = readFile("SUPABASE_QUERY_PERFORMANCE_FIX.sql");
  const lmsSetupSql = readFile("SUPABASE_LMS_SETUP.sql");
  const sql = [performanceSql, lmsSetupSql].join("\n");

  test("message and notification dashboard filters have supporting indexes", () => {
    expect(sql).toMatch(/create\s+index\s+if\s+not\s+exists\s+idx_notifications_user_created_at\s+on\s+public\.notifications\s*\(\s*user_id\s*,\s*created_at\s+desc\s*\)/i);
    expect(sql).toMatch(/create\s+index\s+if\s+not\s+exists\s+idx_messages_recipient_read_created_at\s+on\s+public\.messages\s*\(\s*recipient_id\s*,\s*is_read\s*,\s*created_at\s+desc\s*\)/i);
    expect(sql).toMatch(/create\s+index\s+if\s+not\s+exists\s+idx_messages_recipient_archived_created_at\s+on\s+public\.messages\s*\(\s*recipient_id\s*,\s*is_archived\s*,\s*created_at\s+desc\s*\)/i);
    expect(sql).toMatch(/create\s+index\s+if\s+not\s+exists\s+idx_messages_sender_archived_created_at\s+on\s+public\.messages\s*\(\s*sender_id\s*,\s*is_archived\s*,\s*created_at\s+desc\s*\)/i);
  });
});
