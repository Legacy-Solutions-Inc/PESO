"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Preserved for structured-logging pipelines. Never include user payloads here.
    console.error("App error boundary:", error.digest ?? error.name);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page could not be loaded. Try again, or contact your administrator if the problem continues.
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
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
