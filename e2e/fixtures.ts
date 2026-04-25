/**
 * Playwright fixtures — synthetic users + seed helpers.
 *
 * Every value here is synthetic. Never paste real PII, real employer names,
 * real phone numbers, or real email addresses into this file or any spec
 * that imports from it.
 *
 * Usage:
 *   import { test } from "./fixtures";
 *   import { expect } from "@playwright/test";
 *
 * The fixture relies on three env vars when seeding/teardown is needed:
 *   E2E_SUPABASE_URL              (defaults to NEXT_PUBLIC_SUPABASE_URL)
 *   E2E_SUPABASE_SERVICE_ROLE_KEY (NOT NEXT_PUBLIC_*; service role)
 *   E2E_TEST_PASSWORD             (shared password for synthetic users)
 *
 * If those env vars are not set, seeding helpers throw so the spec
 * skips cleanly.
 */

import { test as base, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.E2E_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE =
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "e2e-test-password!42";

const SYNTHETIC = {
  admin: {
    email: "e2e-admin@peso-lambunao.test",
    password: TEST_PASSWORD,
    role: "admin" as const,
  },
  encoder: {
    email: "e2e-encoder@peso-lambunao.test",
    password: TEST_PASSWORD,
    role: "encoder" as const,
  },
};

export interface SyntheticUser {
  email: string;
  password: string;
  role: "admin" | "encoder";
}

export interface E2EFixtures {
  syntheticUsers: typeof SYNTHETIC;
  loginAs(page: Page, user: SyntheticUser): Promise<void>;
  logout(page: Page): Promise<void>;
  adminClient(): SupabaseClient;
}

function getAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error(
      "E2E seeding requires E2E_SUPABASE_URL + E2E_SUPABASE_SERVICE_ROLE_KEY env vars (synthetic project; never the real prod service role)."
    );
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });
}

export const test = base.extend<E2EFixtures>({
  syntheticUsers: async ({}, use) => {
    await use(SYNTHETIC);
  },

  loginAs: async ({}, use) => {
    await use(async (page, user) => {
      await page.goto("/login");
      await page.getByLabel("Email").fill(user.email);
      await page.getByLabel("Password").fill(user.password);
      await page.getByRole("button", { name: /sign in|log in/i }).click();
      // Successful login lands on /dashboard.
      await page.waitForURL(/\/dashboard/);
    });
  },

  logout: async ({}, use) => {
    await use(async (page) => {
      // Sign-out button is in the dashboard sidebar footer, aria-label="Sign out".
      const trigger = page.getByRole("button", { name: /sign out/i }).first();
      await trigger.click();
      await page.waitForURL(/\/login|\/$/);
    });
  },

  adminClient: async ({}, use) => {
    await use(getAdminClient);
  },
});

export { expect } from "@playwright/test";
