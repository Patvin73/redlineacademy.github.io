const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function readFile(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

describe("dashboard realtime subscription contract", () => {
  test.each([
    ["student dashboard", "js/dashboard-student.js", "studentNotificationChannel", "studentMessageChannel"],
    ["admin dashboard", "js/dashboard-admin.js", "adminNotificationChannel", "adminMessageChannel"],
  ])("%s reuses channels for the current user and removes stale channels", (_label, file, notificationChannel, messageChannel) => {
    const source = readFile(file);

    expect(source).toMatch(/function\s+removeRealtimeChannel\s*\(/);
    expect(source).toMatch(new RegExp(`if \\(${notificationChannel} && ${notificationChannel}UserId === userId\\) return;`));
    expect(source).toMatch(new RegExp(`removeRealtimeChannel\\(${notificationChannel}\\);`));
    expect(source).toMatch(new RegExp(`${notificationChannel} = window\\.lmsSupabase\\s*\\.channel\\(`));
    expect(source).toMatch(new RegExp(`if \\(${messageChannel} && ${messageChannel}UserId === userId\\) return;`));
    expect(source).toMatch(new RegExp(`removeRealtimeChannel\\(${messageChannel}\\);`));
    expect(source).toMatch(new RegExp(`${messageChannel} = channel;`));
  });
});
