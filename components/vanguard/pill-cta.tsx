import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { HairlineIcon } from "./hairline-icon";

type PillVariant = "primary" | "ghost" | "quiet";
type PillSize = "sm" | "md" | "lg";

const variantClasses: Record<PillVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/92 focus-visible:ring-foreground/45",
  ghost:
    "bg-transparent text-foreground ring-1 ring-inset ring-foreground/12 hover:bg-foreground/[0.04] focus-visible:ring-foreground/45",
  quiet:
    "bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.07] focus-visible:ring-foreground/45",
};

const sizeClasses: Record<PillSize, string> = {
  sm: "h-9 pl-4 pr-1.5 text-[13px]",
  md: "h-11 pl-5 pr-2 text-sm",
  lg: "h-14 pl-7 pr-2.5 text-base",
};

const iconSlotSize: Record<PillSize, string> = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
};

const iconSize: Record<PillSize, string> = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-4",
};

const iconSlotTone: Record<PillVariant, string> = {
  primary: "bg-background/15 text-background",
  ghost: "bg-foreground/[0.06] text-foreground",
  quiet: "bg-foreground/[0.08] text-foreground",
};

function buildPillClasses({
  variant,
  size,
  fullWidth,
  className,
}: {
  variant: PillVariant;
  size: PillSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return cn(
    "group relative inline-flex items-center justify-between rounded-full font-medium",
    "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
    "outline-none focus-visible:ring-4 active:scale-[0.98]",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

function PillInner({
  variant,
  size,
  icon: Icon,
  loading = false,
  children,
}: {
  variant: PillVariant;
  size: PillSize;
  icon: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <span className="mr-2 whitespace-nowrap font-medium tracking-[-0.01em]">
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "group-hover:-translate-y-[1px] group-hover:translate-x-[2px] group-hover:scale-[1.06]",
          iconSlotSize[size],
          iconSlotTone[variant],
        )}
      >
        <HairlineIcon
          icon={Icon}
          className={cn(
            iconSize[size],
            "transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
            loading && "animate-spin",
          )}
        />
      </span>
    </>
  );
}

type AnchorProps = Omit<React.ComponentProps<"a">, "ref">;
type ButtonProps = Omit<React.ComponentProps<"button">, "ref">;

type SharedProps = {
  variant?: PillVariant;
  size?: PillSize;
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type PillCTAProps =
  | (SharedProps & { asChild: true; children: React.ReactNode })
  | (SharedProps & AnchorProps & { href: string; asChild?: false })
  | (SharedProps & ButtonProps & { href?: undefined; asChild?: false });

export function PillCTA({
  variant = "primary",
  size = "md",
  icon: Icon = ArrowUpRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: PillCTAProps) {
  const shared = buildPillClasses({ variant, size, fullWidth, className });

  if ("asChild" in rest && rest.asChild) {
    return (
      <Slot.Root className={shared}>
        {React.Children.only(children as React.ReactElement)}
      </Slot.Root>
    );
  }

  const inner = (
    <PillInner variant={variant} size={size} icon={Icon} loading={loading}>
      {children}
    </PillInner>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { asChild, ...anchorRest } = rest as SharedProps & AnchorProps & { asChild?: false };
    void asChild;
    return (
      <a className={shared} {...anchorRest}>
        {inner}
      </a>
    );
  }

  const { asChild, ...buttonRest } = rest as SharedProps & ButtonProps & { asChild?: false };
  void asChild;
  return (
    <button className={shared} {...buttonRest}>
      {inner}
    </button>
  );
}

/* ————————————————————————————————————————————————
 * PillLink — convenience wrapper for Next.js <Link>.
 * Collapses the asChild boilerplate by rendering the same
 * Button-in-Button structure PillCTA uses in its default branch.
 * ———————————————————————————————————————————————— */

interface PillLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "className" | "children"> {
  variant?: PillVariant;
  size?: PillSize;
  icon?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PillLink({
  variant = "primary",
  size = "md",
  icon: Icon = ArrowUpRight,
  fullWidth = false,
  className,
  children,
  ...rest
}: PillLinkProps) {
  return (
    <Link
      className={buildPillClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      <PillInner variant={variant} size={size} icon={Icon}>
        {children}
      </PillInner>
    </Link>
  );
}
