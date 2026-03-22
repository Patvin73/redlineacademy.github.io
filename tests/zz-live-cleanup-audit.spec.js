const { test, expect } = require("@playwright/test");

const {
  assertLiveEnv,
  findLiveQaLeftovers,
  getProfileByEmail,
  installLiveSupabaseConfig,
  liveUsers,
  signIn,
} = require("./support/live-qa");

assertLiveEnv();

function buildReferenceEmails() {
  return {
    student: liveUsers.student.email,
    admin: liveUsers.admin.email,
    trainer: liveUsers.trainer.email,
    marketer: liveUsers.marketer.email,
  };
}

test.describe.serial("Live QA cleanup audit", { tag: ["@cleanup-audit", "@supabase"] }, () => {
  test.setTimeout(90000);

  test("no orphan test data remains after live suite", async ({ page }) => {
    await installLiveSupabaseConfig(page);
    await signIn(page, "admin");

    const referenceIds = {};
    const emails = buildReferenceEmails();

    for (const [role, email] of Object.entries(emails)) {
      const profile = await getProfileByEmail(page, email);
      expect(
        profile.error,
        `Unable to load ${role} profile for cleanup audit.`
      ).toBeNull();
      expect(
        profile.data?.id,
        `Missing ${role} profile id for cleanup audit.`
      ).toBeTruthy();
      referenceIds[`${role}Id`] = profile.data.id;
    }

    const sinceIso = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const leftovers = await findLiveQaLeftovers(page, {
      sinceIso,
      referenceIds,
    });

    if (leftovers.length > 0) {
      const details = leftovers
        .map((row) => `- ${row.table} id=${row.id ?? "n/a"} :: ${row.reason}`)
        .join("\n");
      console.error(`Live cleanup audit found leftover QA rows:\n${details}`);
    }

    expect(
      leftovers,
      leftovers.length > 0
        ? `Live cleanup audit found leftover QA rows:\n${leftovers
            .map((row) => `- ${row.table} id=${row.id ?? "n/a"} :: ${row.reason}`)
            .join("\n")}`
        : "No leftover QA rows should remain after the live suite."
    ).toHaveLength(0);
  });
});
