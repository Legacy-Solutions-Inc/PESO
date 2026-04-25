import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, FileText, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JobseekerRegistrationFormLayout } from "@/components/jobseeker-registration/form-layout";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { Reveal } from "@/components/vanguard/reveal";

export const metadata = {
  title: "Register jobseeker – NSRP",
  description: "Encode a new jobseeker into the PESO Lambunao NSRP registry.",
};

export default async function JobseekerRegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 pb-4">
      {/* —— Minimal premium preamble · does not touch the form itself —— */}
      <div className="space-y-6 pt-4">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <li>
              <Link
                href="/dashboard"
                className="transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
              >
                Dashboard
              </Link>
            </li>
            <li aria-hidden>
              <HairlineIcon icon={ChevronRight} className="size-3" />
            </li>
            <li>
              <Link
                href="/jobseekers"
                className="transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
              >
                Jobseeker records
              </Link>
            </li>
            <li aria-hidden>
              <HairlineIcon icon={ChevronRight} className="size-3" />
            </li>
            <li className="font-medium text-foreground">Register</li>
          </ol>
        </nav>

        <Reveal>
          <header className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div className="space-y-4">
              <EyebrowTag tone="primary" dot>
                NSRP · New registration
              </EyebrowTag>
              <h1 className="font-serif text-[clamp(2rem,3.8vw,3.25rem)] font-medium leading-[1.03] tracking-[-0.025em] text-foreground">
                Register a new jobseeker
              </h1>
              <p className="max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
                A nine-step form aligned to the DOLE National Skills
                Registration Program. Drafts auto-save as you go — you can
                safely pause and resume.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 text-[12px] text-muted-foreground md:items-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] px-3 py-1.5 font-medium text-foreground/80 ring-1 ring-inset ring-foreground/[0.06]">
                <HairlineIcon icon={FileText} className="size-3" />
                <span className="uppercase tracking-[0.16em] text-[10.5px]">
                  NSRP Form · 9 steps
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
                <HairlineIcon icon={Sparkles} className="size-3" />
                Autosave every 30s
              </span>
            </div>
          </header>
        </Reveal>
      </div>

      {/* —— Original form layout, untouched —— */}
      <JobseekerRegistrationFormLayout encoderEmail={user.email ?? ""} />
    </div>
  );
}
