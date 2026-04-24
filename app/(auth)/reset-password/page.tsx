import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";
import { AmbientMesh } from "@/components/vanguard/ambient-mesh";
import { BezelSurface } from "@/components/vanguard/bezel-surface";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { Reveal } from "@/components/vanguard/reveal";

export const metadata = {
  title: "Set new password – NSRP Jobseeker Registration",
  description: "Set a new password for your PESO Lambunao account",
};

export default async function ResetPasswordPage() {
  // Require a valid session (either a normal login or a recovery session
  // minted by /auth/callback after the email link was clicked). Without a
  // session, the update would silently fail — send the user back to start.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/forgot-password?message=" +
        encodeURIComponent(
          "Your reset link is invalid or has expired. Request a new one below."
        )
    );
  }

  return (
    <main className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-6 py-20">
      <AmbientMesh tone="warm" position="fixed" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 vanguard-grain opacity-[0.04]"
      />

      <div className="relative z-10 w-full max-w-[460px]">
        <Reveal delay={40}>
          <div className="mb-8 flex items-center justify-center gap-3">
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
          </div>
        </Reveal>

        <Reveal delay={120}>
          <BezelSurface
            radius="2xl"
            shellPadding="2"
            glow
            innerClassName="p-8 sm:p-10"
          >
            <div className="mb-8 flex flex-col items-start">
              <EyebrowTag tone="primary" dot className="mb-5">
                Set new password
              </EyebrowTag>
              <h1 className="font-serif text-[2rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                Choose a new password
              </h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Pick a strong password you haven’t used elsewhere. You’ll be
                asked to sign in again once it’s saved.
              </p>
            </div>

            <ResetPasswordForm />
          </BezelSurface>
        </Reveal>

        <Reveal delay={260}>
          <ul className="mt-8 grid gap-2 text-[12px] text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/70">
                <HairlineIcon icon={ShieldCheck} className="size-3" />
              </span>
              <span>
                Your password is stored one-way hashed by Supabase — nobody,
                including administrators, can read it.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/[0.04] text-foreground/70">
                <HairlineIcon icon={KeyRound} className="size-3" />
              </span>
              <span>
                Having second thoughts?{" "}
                <Link
                  href="/login"
                  className="font-medium text-foreground underline-offset-4 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:underline"
                >
                  Back to sign in
                </Link>
                .
              </span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={380}>
          <p className="mt-10 text-center text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground/80">
            Department of Labor and Employment · National Skills Registration Program
          </p>
        </Reveal>
      </div>
    </main>
  );
}
