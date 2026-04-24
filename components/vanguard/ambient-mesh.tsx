import * as React from "react";
import { cn } from "@/lib/utils";

type MeshTone = "warm" | "cool" | "quiet" | "institutional";

/*
 * Gradients reference design-system CSS variables via color-mix so they
 * adapt to palette shifts and dark mode automatically.
 * Mapping:
 *   oklch(0.42 0.13 258) → var(--primary)
 *   oklch(0.64 0.13 70)  → var(--status-warning)
 *   oklch(0.50 0.10 235) → var(--status-info)
 *   oklch(0.22 0.015 60) → var(--foreground)
 *   oklch(0.48 0.17 25)  → var(--destructive)
 */
const tonePalettes: Record<MeshTone, string> = {
  // Warm cream with a soft institutional-blue hotspot
  warm: `
    radial-gradient(60% 45% at 12% 18%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 65%),
    radial-gradient(45% 35% at 88% 82%, color-mix(in oklch, var(--status-warning) 7%, transparent), transparent 70%),
    radial-gradient(90% 60% at 50% 110%, color-mix(in oklch, var(--foreground) 6%, transparent), transparent 60%)
  `,
  cool: `
    radial-gradient(55% 40% at 80% 20%, color-mix(in oklch, var(--status-info) 10%, transparent), transparent 70%),
    radial-gradient(50% 40% at 15% 85%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 70%)
  `,
  quiet: `
    radial-gradient(70% 50% at 50% 0%, color-mix(in oklch, var(--foreground) 4%, transparent), transparent 60%),
    radial-gradient(60% 40% at 50% 100%, color-mix(in oklch, var(--foreground) 4%, transparent), transparent 60%)
  `,
  institutional: `
    radial-gradient(45% 35% at 10% 10%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%),
    radial-gradient(35% 30% at 95% 25%, color-mix(in oklch, var(--destructive) 6%, transparent), transparent 70%),
    radial-gradient(60% 45% at 50% 115%, color-mix(in oklch, var(--primary) 6%, transparent), transparent 60%)
  `,
};

interface AmbientMeshProps {
  tone?: MeshTone;
  className?: string;
  /** Render as fixed (viewport-wide) or absolute (section-wide). */
  position?: "fixed" | "absolute";
  /** Layer grain noise on top of the mesh. Default true. */
  grain?: boolean;
}

export function AmbientMesh({
  tone = "warm",
  className,
  position = "absolute",
  grain = true,
}: AmbientMeshProps) {
  return (
    <div
      aria-hidden
      className={cn(
        position === "fixed" ? "fixed inset-0" : "absolute inset-0",
        "pointer-events-none z-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: tonePalettes[tone] }}
      />
      {grain ? (
        <div className="absolute inset-0 opacity-[0.035] mix-blend-multiply vanguard-grain" />
      ) : null}
    </div>
  );
}
