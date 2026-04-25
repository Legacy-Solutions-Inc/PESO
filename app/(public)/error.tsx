"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Public-surface error boundary. Renders a friendly message + opaque
 * digest only — never error.message or error.stack — so production
 * failures cannot leak file paths, table names, or env hints to anon
 * visitors.
 */
export default function PublicErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Digest-only — preserved for the Vercel Logs pipeline.
    console.error("Public error boundary:", error.digest ?? error.name);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-start justify-center gap-4 px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Something went wrong
      </p>
      <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight text-foreground">
        We could not load this page.
      </h1>
      <p className="max-w-prose text-[15px] leading-relaxed text-foreground/85">
        Please try again. If the problem continues, the page may be
        temporarily unavailable while we publish updates.
      </p>
      {error.digest && (
        <p className="font-mono text-[12px] text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 py-2 text-[13.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 py-2 text-[13.5px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
