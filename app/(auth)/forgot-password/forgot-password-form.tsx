"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";
import { resetPassword } from "./actions";
import type { ForgotPasswordState } from "./logic";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { PillCTA } from "@/components/vanguard/pill-cta";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({
  initialMessage,
}: {
  initialMessage?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialMessage
      ? ({ message: initialMessage } as ForgotPasswordState)
      : (null as ForgotPasswordState | null),
  );

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

      {state?.message ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-[0.9rem] bg-status-positive/[0.08] px-3.5 py-2.5 text-[13px] text-status-positive ring-1 ring-inset ring-status-positive/20"
        >
          <HairlineIcon
            icon={CheckCircle2}
            className="mt-0.5 size-4 shrink-0"
          />
          <span className="leading-snug">{state.message}</span>
        </div>
      ) : null}

      <VanguardField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@lambunao.gov.ph"
        icon={Mail}
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
        {isPending ? "Sending link…" : "Send reset link"}
      </PillCTA>

      <div className="flex items-center justify-center pt-1">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.05] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-x-[2px]">
            <HairlineIcon icon={ArrowUpLeft} className="size-3" />
          </span>
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

interface VanguardFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ComponentProps<typeof HairlineIcon>["icon"];
}

function VanguardField({
  label,
  icon,
  id,
  className,
  ...props
}: VanguardFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/60"
      >
        {label}
      </label>
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
              "w-full bg-transparent py-3.5 pl-11 pr-4 text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground/60",
              className,
            )}
          />
        </div>
      </div>
    </div>
  );
}
