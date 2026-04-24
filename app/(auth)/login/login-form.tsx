"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn, type SignInState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  message,
}: {
  message?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(signIn, null as SignInState | null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Request one
        </Link>
      </p>
    </form>
  );
}
