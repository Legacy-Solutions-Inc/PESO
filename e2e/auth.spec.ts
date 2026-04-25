import { test, expect } from "./fixtures";

test.describe("auth flow", () => {
  test("admin login lands on /dashboard", async ({ page, loginAs, syntheticUsers }) => {
    await loginAs(page, syntheticUsers.admin);
    await expect(page).toHaveURL(/\/dashboard/);
    // Sidebar nav should expose admin-only items.
    await expect(page.getByRole("link", { name: /user management/i })).toBeVisible();
  });

  test("logout returns to /login or /", async ({ page, loginAs, logout, syntheticUsers }) => {
    await loginAs(page, syntheticUsers.admin);
    await logout(page);
    await expect(page).toHaveURL(/\/login|\/$/);
  });

  test("bad password keeps the user on /login with an error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("e2e-admin@peso-lambunao.test");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    // Stays on /login (no redirect to /dashboard).
    await expect(page).toHaveURL(/\/login/);
    // Surface some error indication — exact copy may vary, but "invalid" or "incorrect"
    // is the conventional language.
    await expect(page.locator("body")).toContainText(/invalid|incorrect|wrong/i);
  });
});
