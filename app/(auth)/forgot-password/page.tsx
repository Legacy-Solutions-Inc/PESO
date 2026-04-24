import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { resetPassword } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Reset password – NSRP Jobseeker Registration",
  description: "Reset your PESO Lambunao account password",
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <main className="w-full max-w-md px-6 py-12">
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="mb-6 flex items-center justify-center gap-4">
          <Image
            alt="Municipality of Lambunao seal"
            src="/lambunao-seal.png"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
          <div className="h-12 w-px bg-border" aria-hidden />
          <Image
            alt="PESO Lambunao logo"
            src="/peso-logo.jpg"
            width={72}
            height={72}
            className="rounded-sm object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          PESO Lambunao
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          NSRP Jobseeker Registration System
        </p>
      </header>

      <section
        aria-labelledby="reset-heading"
        className="rounded-lg border border-border bg-card p-8 shadow-sm"
      >
        <div className="mb-6">
          <h2
            id="reset-heading"
            className="text-xl font-medium tracking-tight text-foreground"
          >
            Reset your password
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the email associated with your account. We will send you a link to set a new password.
          </p>
        </div>

        <ForgotPasswordForm searchParams={searchParams} />

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Department of Labor and Employment &middot; National Skills Registration Program
      </p>
    </main>
  );
}

async function ForgotPasswordForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <form action={resetPassword} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-md border border-status-positive/30 bg-status-positive/10 px-3 py-2 text-sm text-status-positive"
        >
          {message}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@lambunao.gov.ph"
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
