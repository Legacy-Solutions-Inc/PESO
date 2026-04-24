import Image from "next/image";
import { ShieldCheck, Users, FileText } from "lucide-react";
import { SignUpForm } from "./sign-up-form";
import { AmbientMesh } from "@/components/vanguard/ambient-mesh";
import { BezelSurface } from "@/components/vanguard/bezel-surface";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { Reveal } from "@/components/vanguard/reveal";

export const metadata = {
  title: "Request account – NSRP Jobseeker Registration",
  description: "Request a PESO Lambunao staff account",
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="relative isolate flex min-h-[100dvh] w-full">
      <AmbientMesh tone="warm" position="fixed" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 vanguard-grain opacity-[0.04]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-col gap-16 px-6 py-16 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12 md:px-10 md:py-24 lg:gap-20 lg:px-16">
        {/* ——————— Left: Editorial display column ——————— */}
        <section className="relative flex flex-col justify-center">
          <Reveal delay={40}>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-[0.75rem] ring-1 ring-inset ring-foreground/10 bg-background shadow-[0_6px_18px_-8px_oklch(0.22_0.015_60_/_0.28)]">
                <Image
                  alt="Municipality of Lambunao seal"
                  src="/lambunao-seal.png"
                  width={40}
                  height={40}
                  className="size-full object-contain p-1"
                  priority
                />
              </div>
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-[0.75rem] ring-1 ring-inset ring-foreground/10 bg-background shadow-[0_6px_18px_-8px_oklch(0.22_0.015_60_/_0.28)]">
                <Image
                  alt="PESO Lambunao logo"
                  src="/peso-logo.jpg"
                  width={40}
                  height={40}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <div className="ml-1">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/55">
                  DOLE · Region VI
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Municipality of Lambunao, Iloilo
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <EyebrowTag tone="primary" dot className="mt-10">
              Staff access
            </EyebrowTag>
          </Reveal>

          <Reveal delay={200}>
            <h1 className="mt-5 font-[family-name:var(--font-source-serif)] text-[clamp(2.75rem,6vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.03em] text-foreground">
              The jobseeker registry,
              <span className="block text-foreground/55">
                handled with care.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={280}>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              A secure, encoder-first companion to the NSRP Jobseeker
              Registration Form. Request an account and your PESO administrator
              will review and approve access.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <ul className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "RLS-scoped PII",
                  meta: "Row-level security",
                },
                {
                  icon: FileText,
                  title: "NSRP-aligned",
                  meta: "DOLE-issued form",
                },
                {
                  icon: Users,
                  title: "Role-aware",
                  meta: "Admin · Encoder",
                },
              ].map(({ icon, title, meta }) => (
                <li key={title}>
                  <BezelSurface
                    radius="xl"
                    shellPadding="1"
                    innerClassName="flex items-start gap-3 p-4"
                  >
                    <span className="mt-0.5 flex size-7 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
                      <HairlineIcon icon={icon} className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium leading-none text-foreground">
                        {title}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                        {meta}
                      </p>
                    </div>
                  </BezelSurface>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={480}>
            <p className="mt-12 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Department of Labor and Employment · National Skills Registration Program
            </p>
          </Reveal>
        </section>

        {/* ——————— Right: Form column ——————— */}
        <section className="relative flex items-center justify-center">
          <Reveal delay={160} className="w-full max-w-[440px]">
            <BezelSurface
              radius="2xl"
              shellPadding="2"
              glow
              innerClassName="p-8 sm:p-10"
            >
              <div className="mb-8">
                <EyebrowTag tone="default" className="mb-5">
                  Request access
                </EyebrowTag>
                <h2
                  id="sign-up-heading"
                  className="font-[family-name:var(--font-source-serif)] text-[2rem] font-medium leading-tight tracking-[-0.02em] text-foreground"
                >
                  Create an account
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  Submit your PESO Lambunao staff email. Access is granted once
                  your administrator approves the request.
                </p>
              </div>

              <SignUpFormWrapper searchParams={searchParams} />
            </BezelSurface>
          </Reveal>
        </section>
      </div>
    </main>
  );
}

async function SignUpFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <SignUpForm initialError={error} />;
}
