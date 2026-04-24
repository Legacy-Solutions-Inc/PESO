"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AuthErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error boundary:", error.digest ?? error.name);
  }, [error]);

  return (
    <main className="w-full max-w-md px-6 py-12">
      <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not load this page. Please try again.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href="/login">Back to sign in</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
