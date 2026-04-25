import { test, expect } from "./fixtures";

/**
 * Anon visitor flow — the public surface must be reachable, must not leak
 * drafts or expired jobs, must serve robots.txt and sitemap.xml, and the
 * privacy notice must render.
 *
 * Synthetic-only: no fixtures rely on real PII. Spec runs against any
 * environment where PLAYWRIGHT_BASE_URL points at a serving instance.
 */

test.describe("public anon visitor", () => {
  test("/ renders the public landing without errors", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /PESO/i }).first()).toBeVisible();
    // Hero CTA pair.
    await expect(page.getByRole("link", { name: /browse jobs/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /read announcements/i })).toBeVisible();
  });

  test("/news index returns 200 and shows no draft markers", async ({ page }) => {
    const response = await page.goto("/news");
    expect(response?.status()).toBe(200);
    // The seed (when run) inserts captions like "Smoke … draft" — the
    // anon list must not include those.
    await expect(page.locator("body")).not.toContainText(/Smoke .* draft/i);
  });

  test("/jobs index returns 200 and shows no expired markers", async ({ page }) => {
    const response = await page.goto("/jobs");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).not.toContainText(/Smoke .* expired/i);
  });

  test("/privacy renders complete content (no TODO outside admin-replaceable fields)", async ({
    page,
  }) => {
    const response = await page.goto("/privacy");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: /privacy notice/i })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(/Data Privacy Act/i);
    // No bare TODO strings in user-visible markup.
    await expect(page.locator("body")).not.toContainText(/\[TBD\]|\[TODO\]|\bTODO:/);
  });

  test("/robots.txt is served with the right disallows", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-agent:\s*\*/i);
    expect(body).toMatch(/Disallow:\s*\/dashboard/i);
    expect(body).toMatch(/Disallow:\s*\/admin/i);
    expect(body).toMatch(/Disallow:\s*\/jobseekers/i);
    expect(body).toMatch(/Disallow:\s*\/users/i);
    expect(body).toMatch(/Disallow:\s*\/api/i);
    expect(body).toMatch(/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/i);
  });

  test("/sitemap.xml is served and includes the public roots", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/news<\/loc>/);
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/jobs<\/loc>/);
    expect(body).toMatch(/<loc>https?:\/\/[^<]+\/privacy<\/loc>/);
  });

  test("/api/health returns 200 with a version", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.version).toBe("string");
  });
});
