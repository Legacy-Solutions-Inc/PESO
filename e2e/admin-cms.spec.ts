import { test, expect } from "./fixtures";

const SYNTH_CAPTION = `E2E synthetic announcement ${Date.now()}`;

test.describe("admin CMS", () => {
  test("admin creates + publishes a news post → anon visitor sees it", async ({
    page,
    loginAs,
    syntheticUsers,
    browser,
  }) => {
    await loginAs(page, syntheticUsers.admin);
    await page.goto("/admin/news");
    await page.getByRole("link", { name: /new post|create/i }).first().click();

    // Caption — synthetic.
    const captionField = page.getByLabel(/caption|message/i).first();
    await captionField.fill(SYNTH_CAPTION);

    // Submit (publish).
    await page
      .getByRole("button", { name: /publish|submit/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    // Anon visitor — fresh context.
    const anonContext = await browser.newContext({ storageState: undefined });
    const anonPage = await anonContext.newPage();
    await anonPage.goto("/news");
    await expect(anonPage.locator("body")).toContainText(SYNTH_CAPTION);
    await anonContext.close();
  });

  test("admin unpublishes the post → anon /news no longer shows it", async ({
    page,
    loginAs,
    syntheticUsers,
    browser,
  }) => {
    await loginAs(page, syntheticUsers.admin);
    await page.goto("/admin/news");
    // Find the synthetic row and open it.
    const row = page.locator(`text=${SYNTH_CAPTION}`).first();
    await row.click();
    await page
      .getByRole("button", { name: /unpublish|move to draft/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    const anonContext = await browser.newContext({ storageState: undefined });
    const anonPage = await anonContext.newPage();
    await anonPage.goto("/news");
    await expect(anonPage.locator("body")).not.toContainText(SYNTH_CAPTION);
    await anonContext.close();
  });

  test("encoder navigating to /admin/news is blocked", async ({
    page,
    loginAs,
    syntheticUsers,
  }) => {
    await loginAs(page, syntheticUsers.encoder);
    const response = await page.goto("/admin/news");
    // Either a 403 from the server gate, or a redirect to /dashboard,
    // depending on the exact gate implementation. Assert one of the two.
    const status = response?.status() ?? 0;
    const onDashboard = page.url().includes("/dashboard");
    const blocked = status === 403 || status === 404 || onDashboard;
    expect(blocked).toBe(true);
  });
});
