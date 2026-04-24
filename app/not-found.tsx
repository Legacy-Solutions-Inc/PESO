import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
      <main className="w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you were looking for does not exist, or you may not have access to it. Check the link or return to the dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
