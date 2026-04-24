import * as React from "react";
import { cn } from "@/lib/utils";

type BezelTone = "card" | "raised" | "sunken" | "invert";

const shellTone: Record<BezelTone, string> = {
  card: "bg-foreground/[0.025] ring-foreground/[0.06]",
  raised: "bg-foreground/[0.035] ring-foreground/[0.08]",
  sunken: "bg-foreground/[0.015] ring-foreground/[0.04]",
  invert: "bg-foreground/90 ring-foreground/40",
};

const coreTone: Record<BezelTone, string> = {
  card: "bg-card text-card-foreground",
  raised: "bg-card text-card-foreground",
  sunken: "bg-background text-foreground",
  invert: "bg-foreground text-background",
};

interface BezelSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  tone?: BezelTone;
  innerClassName?: string;
  glow?: boolean;
  /** Padding shell. Default p-1.5 gives concentric 0.375rem inner radius deduction. */
  shellPadding?: "1" | "1.5" | "2";
  /** Outer radius in rem-ish scale. Default 2rem → inner becomes calc(2rem - 0.375rem). */
  radius?: "xl" | "2xl" | "3xl";
  children: React.ReactNode;
}

const shellPadClass: Record<NonNullable<BezelSurfaceProps["shellPadding"]>, string> = {
  "1": "p-1",
  "1.5": "p-1.5",
  "2": "p-2",
};

const shellRadius: Record<NonNullable<BezelSurfaceProps["radius"]>, string> = {
  xl: "rounded-[1.5rem]",
  "2xl": "rounded-[2rem]",
  "3xl": "rounded-[2.5rem]",
};

const coreRadius: Record<NonNullable<BezelSurfaceProps["radius"]>, string> = {
  xl: "rounded-[calc(1.5rem-0.375rem)]",
  "2xl": "rounded-[calc(2rem-0.375rem)]",
  "3xl": "rounded-[calc(2.5rem-0.375rem)]",
};

export function BezelSurface({
  as: Component = "div",
  tone = "card",
  radius = "2xl",
  shellPadding = "1.5",
  glow = false,
  className,
  innerClassName,
  children,
  ...props
}: BezelSurfaceProps) {
  return (
    <Component
      className={cn(
        "relative ring-1 ring-inset isolate",
        shellTone[tone],
        shellRadius[radius],
        shellPadClass[shellPadding],
        glow &&
          "shadow-[0_32px_80px_-48px_oklch(0.42_0.13_258_/_0.28),0_8px_24px_-18px_oklch(0.22_0.015_60_/_0.18)]",
        !glow &&
          "shadow-[0_20px_60px_-40px_oklch(0.22_0.015_60_/_0.22)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "relative h-full w-full",
          coreRadius[radius],
          coreTone[tone],
          "shadow-[inset_0_1px_0_oklch(1_0_0_/_0.6),inset_0_-1px_0_oklch(0.22_0.015_60_/_0.04)]",
          "dark:shadow-[inset_0_1px_0_oklch(1_0_0_/_0.08),inset_0_-1px_0_oklch(0_0_0_/_0.4)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Component>
  );
}
