"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { signIn, type SignInState } from "./actions";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { PillCTA } from "@/components/vanguard/pill-cta";
import { cn } from "@/lib/utils";

export function LoginForm({ message }: { message?: string | null }) {
  const [state, formAction, isPending] = useActionState(
    signIn,
    null as SignInState | null,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[0.9rem] bg-destructive/[0.06] px-3.5 py-2.5 text-[13px] text-destructive ring-1 ring-inset ring-destructive/15"
        >
          <HairlineIcon
            icon={AlertTriangle}
            className="mt-0.5 size-4 shrink-0"
          />
          <span className="leading-snug">{state.error}</span>
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-[0.9rem] bg-status-positive/[0.08] px-3.5 py-2.5 text-[13px] text-status-positive ring-1 ring-inset ring-status-positive/20"
        >
          <HairlineIcon
            icon={CheckCircle2}
            className="mt-0.5 size-4 shrink-0"
          />
          <span className="leading-snug">{message}</span>
        </div>
      ) : null}

      <VanguardField
        id="email"
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        placeholder="you@lambunao.gov.ph"
        icon={Mail}
      />

      <VanguardField
        id="password"
        name="password"
        label="Password"
        labelAddon={
          <Link
            href="/forgot-password"
            className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
          >
            Forgot?
          </Link>
        }
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        required
        placeholder="••••••••••"
        icon={Lock}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <HairlineIcon
              icon={showPassword ? EyeOff : Eye}
              className="size-4"
            />
          </button>
        }
      />

      <PillCTA
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isPending}
        icon={isPending ? Loader2 : ArrowRight}
        loading={isPending}
      >
        {isPending ? "Signing in…" : "Sign in"}
      </PillCTA>

      <p className="text-center text-[12.5px] text-muted-foreground">
        Don’t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:underline"
        >
          Request one
        </Link>
      </p>
    </form>
  );
}

/* — Shadcn-aligned field that opts into the Vanguard double-bezel input — */
interface VanguardFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelAddon?: React.ReactNode;
  icon: React.ComponentProps<typeof HairlineIcon>["icon"];
  trailing?: React.ReactNode;
}

function VanguardField({
  label,
  labelAddon,
  icon,
  trailing,
  id,
  className,
  ...props
}: VanguardFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/60"
        >
          {label}
        </label>
        {labelAddon}
      </div>
      <div
        className={cn(
          "group relative rounded-2xl bg-foreground/[0.025] p-[1.5px] ring-1 ring-inset ring-foreground/[0.06]",
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "focus-within:ring-foreground/20 focus-within:bg-foreground/[0.04]",
          "focus-within:shadow-[0_12px_32px_-20px_oklch(0.42_0.13_258_/_0.35)]",
        )}
      >
        <div className="relative flex items-center rounded-[calc(1rem-1.5px)] bg-card shadow-[inset_0_1px_0_oklch(1_0_0_/_0.6)]">
          <HairlineIcon
            icon={icon}
            className="pointer-events-none absolute left-4 size-4 text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-focus-within:text-foreground"
          />
          <input
            id={id}
            {...props}
            className={cn(
              "w-full bg-transparent py-3.5 pl-11 text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground/60",
              trailing ? "pr-12" : "pr-4",
              className,
            )}
          />
          {trailing}
        </div>
      </div>
    </div>
  );
}
