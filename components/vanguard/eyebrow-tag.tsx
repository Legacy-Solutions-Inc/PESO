import * as React from "react";
import { cn } from "@/lib/utils";

type EyebrowTone = "default" | "muted" | "primary" | "positive" | "warning";

const toneClasses: Record<EyebrowTone, string> = {
  default:
    "bg-foreground/[0.04] text-foreground/70 ring-foreground/[0.06]",
  muted:
    "bg-muted text-muted-foreground ring-border/60",
  primary:
    "bg-primary/[0.06] text-primary ring-primary/15",
  positive:
    "bg-status-positive/10 text-status-positive ring-status-positive/20",
  warning:
    "bg-status-warning/12 text-status-warning ring-status-warning/25",
};

interface EyebrowTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: EyebrowTone;
  dot?: boolean;
}

export function EyebrowTag({
  tone = "default",
  dot = false,
  className,
  children,
  ...props
}: EyebrowTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className={cn(
            "size-1 rounded-full",
            tone === "primary" && "bg-primary/80",
            tone === "positive" && "bg-status-positive/80",
            tone === "warning" && "bg-status-warning/80",
            (tone === "default" || tone === "muted") && "bg-foreground/40",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
