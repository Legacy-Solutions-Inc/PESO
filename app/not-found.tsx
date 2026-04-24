import { ArrowUpRight, Compass, Home, LogIn } from "lucide-react";
import { AmbientMesh } from "@/components/vanguard/ambient-mesh";
import { BezelSurface } from "@/components/vanguard/bezel-surface";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { PillLink } from "@/components/vanguard/pill-cta";
import { Reveal } from "@/components/vanguard/reveal";

export default function NotFoundPage() {
  return (
    <main className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-6 py-20 text-foreground">
      <AmbientMesh tone="warm" position="fixed" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 vanguard-grain opacity-[0.04]"
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* —— Z-Axis Cascade: three stacked cards w/ modest rotation (desktop only) —— */}

        {/* Back card: 404 display */}
        <Reveal offsetY={32} blur={10}>
          <BezelSurface
            radius="3xl"
            shellPadding="2"
            glow
            className="relative md:-rotate-[2.5deg]"
            innerClassName="relative overflow-hidden px-10 py-12 sm:px-14 sm:py-16"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-[340px] rounded-full opacity-80 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-20 size-[300px] rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklch, var(--status-warning) 20%, transparent), transparent 70%)",
              }}
            />

            <div className="relative flex flex-col items-start gap-6">
              <EyebrowTag tone="primary" dot>
                Error · 404
              </EyebrowTag>

              <p
                data-tabular
                className="font-serif text-[clamp(5rem,14vw,9rem)] font-medium leading-[0.92] tracking-[-0.045em] text-foreground"
              >
                Off the
                <span className="block text-foreground/45">map.</span>
              </p>

              <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                The page you were looking for doesn’t exist, was moved, or
                may be outside your role’s access. Neither your session nor
                any records were affected.
              </p>
            </div>
          </BezelSurface>
        </Reveal>

        {/* Mid card: route hint — overlaps the display card */}
        <Reveal offsetY={24} blur={8} delay={160}>
          <BezelSurface
            radius="2xl"
            shellPadding="1.5"
            className="relative z-[1] -mt-10 ml-auto w-[min(100%,420px)] md:-mt-14 md:mr-6 md:rotate-[1.5deg]"
            innerClassName="flex items-start gap-4 p-5"
          >
            <span className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-primary/[0.08] text-primary ring-1 ring-inset ring-primary/15">
              <HairlineIcon icon={Compass} className="size-4" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Quick check
              </p>
              <p className="text-[13.5px] leading-relaxed text-foreground/85">
                Confirm the link, or return to a known surface. Admin-only
                pages are invisible to encoders.
              </p>
            </div>
          </BezelSurface>
        </Reveal>

        {/* Front card: CTA cluster — the forwardmost layer */}
        <Reveal offsetY={20} blur={6} delay={280}>
          <BezelSurface
            radius="2xl"
            shellPadding="1.5"
            className="relative z-[2] mt-6 md:mt-8 md:-rotate-[0.75deg]"
            innerClassName="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-foreground/[0.05]">
                <HairlineIcon icon={ArrowUpRight} className="size-3.5" />
              </span>
              <span className="text-[13px] text-muted-foreground">
                Return to a working surface:
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <PillLink href="/login" variant="ghost" size="sm" icon={LogIn}>
                Sign in
              </PillLink>
              <PillLink href="/" variant="primary" size="sm" icon={Home}>
                Dashboard
              </PillLink>
            </div>
          </BezelSurface>
        </Reveal>

        <Reveal delay={440}>
          <p className="mt-10 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
            PESO Lambunao · NSRP Jobseeker Registration System
          </p>
        </Reveal>
      </div>
    </main>
  );
}
