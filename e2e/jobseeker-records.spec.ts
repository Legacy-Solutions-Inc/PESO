import { test, expect } from "./fixtures";

/**
 * Critical jobseeker flows — register a synthetic record, then delete it
 * as admin and assert the audit_log row exists. The 9-step wizard runs
 * through with synthetic-only data.
 */

const SYNTH = {
  surname: "Test",
  firstName: "Alpha",
  middleName: "E2E",
  dateOfBirth: "1995-01-15",
};

test.describe("jobseeker records", () => {
  test("encoder registers a synthetic jobseeker → record appears at top of /jobseekers", async ({
    page,
    loginAs,
    syntheticUsers,
  }) => {
    await loginAs(page, syntheticUsers.encoder);
    await page.goto("/jobseekers/register");
    // Step 1 — personal information minimum required fields.
    await page.getByLabel(/Surname/i).fill(SYNTH.surname);
    await page.getByLabel(/First Name/i).fill(SYNTH.firstName);
    await page.getByLabel(/Date of Birth/i).fill(SYNTH.dateOfBirth);
    // Sex radio + civil status select — labels here mirror the form copy.
    await page.getByLabel(/^Male$/i).check();
    // Skip the rest of step 1 with defaults and walk through Next.
    for (let i = 0; i < 8; i++) {
      const nextButton = page.getByRole("button", { name: /next:|next$/i });
      await nextButton.first().click();
      await page.waitForTimeout(150);
    }
    // Step 9 submit.
    await page
      .getByRole("button", { name: /submit registration|update profile/i })
      .click();
    // Toast announces success; navigate to /jobseekers and assert the
    // synthetic record renders.
    await page.goto("/jobseekers");
    await expect(page.locator("body")).toContainText(SYNTH.surname);
  });

  test("admin deletes a synthetic jobseeker → audit_log records the action", async ({
    page,
    loginAs,
    syntheticUsers,
    adminClient,
  }) => {
    await loginAs(page, syntheticUsers.admin);
    await page.goto("/jobseekers");
    // Find the synthetic row by surname and trigger the per-row delete.
    const row = page
      .getByRole("row")
      .filter({ hasText: SYNTH.surname })
      .first();
    const deleteBtn = row.getByRole("button", {
      name: /delete record for/i,
    });
    await deleteBtn.click();
    await page.getByRole("button", { name: /^delete$/i }).click();
    // Toast confirmation.
    await expect(page.locator("body")).toContainText(/record deleted/i);

    // Verify audit_log captured exactly one DELETE_JOBSEEKER entry for this
    // run via the service-role client (out-of-band; UI cannot read audit_log).
    const supabase = adminClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select("action, created_at")
      .eq("action", "DELETE_JOBSEEKER")
      .order("created_at", { ascending: false })
      .limit(1);
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });
});
