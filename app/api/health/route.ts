import { NextResponse } from "next/server";

/**
 * Health probe — no database, no auth, no PII. Returns the deployment's
 * commit SHA so uptime checks can correlate failures with a specific
 * Vercel deployment.
 *
 * Vercel injects VERCEL_GIT_COMMIT_SHA at build time on every preview
 * and production deploy. Outside Vercel (e.g. local `npm run dev`) it
 * falls back to "dev" so the probe still answers 200.
 */

export const dynamic = "force-dynamic";
export const runtime = "edge";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
      env: process.env.VERCEL_ENV ?? "local",
      ts: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}
