"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { JobseekerFullRecord } from "../../actions";
import type { JobseekerRegistrationData as Reg } from "@/lib/validations/jobseeker-registration";

// ─── formatting helpers (preserved behavior) ──────────────────────────────

function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new Date(value).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function computeAge(dob: string | undefined): number | null {
  if (!dob) return null;
  try {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  } catch {
    return null;
  }
}

const SEX_MAP: Record<string, string> = { MALE: "Male", FEMALE: "Female" };
const CIVIL_STATUS_MAP: Record<string, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  WIDOWED: "Widowed",
  SEPARATED: "Separated",
};
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  PART_TIME: "Part time",
  FULL_TIME: "Full time",
};
const EMPLOYMENT_STATUS_MAP: Record<string, string> = {
  EMPLOYED: "Employed",
  UNEMPLOYED: "Unemployed",
};
const EMPLOYED_TYPE_MAP: Record<string, string> = {
  WAGE: "Wage",
  SELF_EMPLOYED: "Self-employed",
};

const lookup = (m: Record<string, string>, s: string | undefined) =>
  s ? (m[s] ?? s) : undefined;

const yesNo = (v: boolean | undefined) =>
  v === true ? "Yes" : v === false ? "No" : undefined;

function disabilitySummary(d: Reg["personalInfo"]["disability"] | undefined) {
  if (!d) return undefined;
  const parts: string[] = [];
  if (d.visual) parts.push("Visual");
  if (d.hearing) parts.push("Hearing");
  if (d.speech) parts.push("Speech");
  if (d.physical) parts.push("Physical");
  if (d.mental) parts.push("Mental");
  if (d.others) parts.push(d.others);
  return parts.length ? parts.join(", ") : undefined;
}

const OTHER_SKILL_LABELS: Record<string, string> = {
  auto_mechanic: "Auto mechanic",
  beautician: "Beautician",
  carpentry_work: "Carpentry",
  computer_literate: "Computer literate",
  domestic_chores: "Domestic chores",
  driver: "Driver",
  electrician: "Electrician",
  embroidery: "Embroidery",
  gardening: "Gardening",
  masonry: "Masonry",
  painter_artist: "Painter / artist",
  painting_jobs: "Painting jobs",
  photography: "Photography",
  plumbing: "Plumbing",
  sewing_dresses: "Sewing dresses",
  stenography: "Stenography",
  tailoring: "Tailoring",
};

// ─── document primitives ──────────────────────────────────────────────────

interface FieldDef {
  label: string;
  value: string | undefined | null;
  numeric?: boolean;
  span?: 1 | 2 | 3;
}

const isPresent = (v: string | undefined | null): v is string =>
  typeof v === "string" && v.trim() !== "";

const META_TEXT = "text-[13px] text-muted-foreground";

function FieldRow({ field }: { field: FieldDef }) {
  const colSpan =
    field.span === 3
      ? "lg:col-span-3 md:col-span-2"
      : field.span === 2
        ? "md:col-span-2"
        : "";
  return (
    <div className={colSpan}>
      <dt className="text-[12px] tracking-wide text-muted-foreground">{field.label}</dt>
      <dd
        className={
          "mt-1 text-[15px] leading-relaxed text-foreground" +
          (field.numeric ? " tabular-nums" : "")
        }
      >
        {field.value}
      </dd>
    </div>
  );
}

const EmptyOnFile = () => (
  <p className="text-[14px] text-muted-foreground">No data on file.</p>
);

function ListEntry({
  title,
  meta,
  body,
  trail,
}: {
  title: string;
  meta?: string;
  body?: string;
  trail?: string;
}) {
  return (
    <li className="space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        {trail && <span data-tabular className={META_TEXT}>{trail}</span>}
      </div>
      {meta && <p data-tabular className={META_TEXT}>{meta}</p>}
      {body && <p className="text-[14px] text-foreground">{body}</p>}
    </li>
  );
}

interface NumeralSectionProps {
  numeral: string;
  title: string;
  value: string;
  fields?: FieldDef[];
  emptyWhen?: boolean;
  children?: React.ReactNode;
}

function NumeralSection({
  numeral,
  title,
  value,
  fields,
  emptyWhen,
  children,
}: NumeralSectionProps) {
  const present = fields?.filter((f) => isPresent(f.value)) ?? [];
  const missing =
    fields?.filter((f) => !isPresent(f.value)).map((f) => f.label.toLowerCase()) ?? [];
  const hasFields = present.length > 0;
  const childIsEmpty = emptyWhen === true;
  const renderedChildren =
    children && (childIsEmpty ? <EmptyOnFile /> : children);
  const hasChildren = !!children;

  return (
    <AccordionItem value={value} className="border-b-0 border-t border-border">
      <AccordionTrigger
        level={2}
        className="min-h-11 py-6 text-foreground hover:no-underline"
      >
        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span
            data-tabular
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            {numeral}
          </span>
          <span className="font-serif text-[1.125rem] font-medium tracking-tight text-foreground sm:text-[1.25rem]">
            {title}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-10 pt-3">
        {hasFields && (
          <dl className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2 lg:grid-cols-3">
            {present.map((f) => <FieldRow key={f.label} field={f} />)}
          </dl>
        )}
        {hasChildren && <div className={hasFields ? "mt-8" : ""}>{renderedChildren}</div>}
        {fields && missing.length > 0 && (
          <p className="mt-6 text-[13px] italic text-muted-foreground">
            Not provided: {missing.join(", ")}.
          </p>
        )}
        {!hasFields && !hasChildren && <EmptyOnFile />}
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── view ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  active: "Active profile",
  archived: "Archived profile",
  pending: "Pending profile",
};

const ALL_VALUES = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi"];

const LANG_COLS = ["read", "write", "speak", "understand"] as const;

interface JobseekerProfileViewProps {
  record: JobseekerFullRecord;
}

export function JobseekerProfileView({ record }: JobseekerProfileViewProps) {
  const personalInfo = record.personal_info ?? ({} as Reg["personalInfo"]);
  const address = personalInfo.address ?? {};
  const employment = record.employment ?? ({} as Reg["employment"]);
  const jobPref = record.job_preference ?? ({} as Reg["jobPreference"]);
  const language = record.language ?? ({} as Reg["language"]);
  const education = record.education ?? ({} as Reg["education"]);
  const training = record.training ?? ({} as Reg["training"]);
  const eligibility = record.eligibility ?? ({} as Reg["eligibility"]);
  const workExperience = record.work_experience ?? ({} as Reg["workExperience"]);
  const skills = record.skills ?? ({} as Reg["skills"]);
  const otherSkills = skills.otherSkills ?? {};
  const certification =
    skills.certification ?? { acknowledged: undefined, signature: "", dateSigned: "" };
  const pesoUse = skills.pesoUseOnly ?? {};
  const referralPrograms = pesoUse.referralPrograms ?? {};

  const fullName = [personalInfo.surname, personalInfo.firstName, personalInfo.middleName]
    .filter(Boolean)
    .join(" ");
  const initials = `${personalInfo.surname?.[0] ?? ""}${personalInfo.firstName?.[0] ?? ""}`;
  const age = computeAge(personalInfo.dateOfBirth);
  const fullAddress =
    [address.houseStreet, address.barangay, address.city, address.province]
      .filter(Boolean)
      .join(", ") || undefined;
  const shortAddress =
    [address.barangay, address.city].filter(Boolean).join(", ") || undefined;

  const subtitleParts = [
    `NSRP-${record.id}`,
    age != null ? `${age} years` : undefined,
    lookup(SEX_MAP, personalInfo.sex),
    lookup(CIVIL_STATUS_MAP, personalInfo.civilStatus),
    shortAddress,
  ].filter(Boolean) as string[];

  const statusLine = `${
    STATUS_LABEL[record.status] ?? "Unknown profile"
  } · Registered ${formatDate(record.created_at) ?? "—"}`;

  // IV
  const langGroups: Array<{
    name: string;
    data?: { read?: boolean; write?: boolean; speak?: boolean; understand?: boolean };
  }> = [
    { name: "English", data: language.english },
    { name: "Filipino", data: language.filipino },
    { name: "Mandarin", data: language.mandarin },
    ...(language.othersName ? [{ name: language.othersName, data: language.others }] : []),
  ];
  const hasLanguageData = langGroups.some(
    (g) => g.data && LANG_COLS.some((k) => g.data?.[k])
  );

  // V
  const eduItems = [
    { level: "Tertiary", course: education.tertiary?.course, grad: education.tertiary?.yearGraduated, last: education.tertiary?.yearLastAttended },
    { level: "Senior High", course: education.seniorHigh?.strand, grad: education.seniorHigh?.yearGraduated, last: education.seniorHigh?.yearLastAttended },
    { level: "Secondary", course: undefined, grad: education.secondary?.yearGraduated, last: education.secondary?.yearLastAttended },
    { level: "Elementary", course: undefined, grad: education.elementary?.yearGraduated, last: education.elementary?.yearLastAttended },
    { level: "Graduate", course: education.graduate?.course, grad: education.graduate?.yearGraduated, last: education.graduate?.yearLastAttended },
  ].filter((i) => i.course || i.grad || i.last);

  // VI
  const trainingEntries = (training.entries ?? []).filter(
    (e) => e.course || e.institution || e.skillsAcquired
  );

  // VII
  const csList = (eligibility.civilService ?? []).filter((cs) => cs.name);
  const plList = (eligibility.professionalLicense ?? []).filter((pl) => pl.name);

  // VIII
  const workEntries = (workExperience.entries ?? []).filter(
    (w) => w.companyName || w.position
  );

  // IX
  const otherSkillsList = Object.entries(OTHER_SKILL_LABELS)
    .filter(([key]) => otherSkills[key as keyof typeof otherSkills])
    .map(([, label]) => label);
  if (otherSkills.others) otherSkillsList.push(String(otherSkills.others));

  // XI
  const referralLabels: Array<[keyof typeof referralPrograms, string]> = [
    ["spes", "SPES"],
    ["gip", "GIP"],
    ["tupad", "TUPAD"],
    ["jobstart", "JobStart"],
    ["dileep", "DILEEP"],
    ["tesda_training", "TESDA Training"],
  ];
  const referralList = referralLabels.filter(([k]) => referralPrograms[k]).map(([, l]) => l);
  if (referralPrograms.others) referralList.push(String(referralPrograms.others));

  return (
    <article>
      {/* Hero — government-archival header */}
      <header className="space-y-3 pb-12 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <Avatar className="size-14 shrink-0 border border-border">
            <AvatarFallback className="bg-muted text-base font-medium text-foreground">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <h1 className="min-w-0 font-serif text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.025em] text-foreground break-words">
            {fullName || "Unnamed jobseeker"}
          </h1>
        </div>
        <p data-tabular className="text-[14px] leading-relaxed text-muted-foreground">
          {subtitleParts.join("  ·  ")}
        </p>
        <p className={META_TEXT}>{statusLine}</p>
        <div className="pt-3">
          <Button asChild variant="outline" size="sm" className="min-h-11">
            <Link
              href={`/jobseekers/${record.id}/edit`}
              aria-label={`Edit ${fullName || "this"} profile`}
            >
              <Pencil className="size-4" />
              Edit profile
            </Link>
          </Button>
        </div>
      </header>

      {/* Hairline-separated SRS sections, all open by default. */}
      <Accordion type="multiple" defaultValue={ALL_VALUES}>
        {/* I — Personal Information (Contact merged in per SRS Section 3.2.2) */}
        <NumeralSection
          numeral="I"
          title="Personal information"
          value="i"
          fields={[
            { label: "Date of birth", value: formatDate(personalInfo.dateOfBirth), numeric: true },
            { label: "Place of birth", value: personalInfo.placeOfBirth },
            { label: "Religion", value: personalInfo.religion },
            { label: "Civil status", value: lookup(CIVIL_STATUS_MAP, personalInfo.civilStatus) },
            { label: "TIN", value: personalInfo.tin, numeric: true },
            { label: "Height", value: personalInfo.height, numeric: true },
            { label: "Disability", value: disabilitySummary(personalInfo.disability), span: 3 },
            { label: "Contact number", value: personalInfo.contactNumber, numeric: true },
            { label: "Email address", value: personalInfo.email, span: 2 },
            { label: "Address", value: fullAddress, span: 3 },
          ]}
        />

        {/* II — Employment Status & Type */}
        <NumeralSection
          numeral="II"
          title="Employment status & type"
          value="ii"
          fields={[
            { label: "Current status", value: lookup(EMPLOYMENT_STATUS_MAP, employment.status) },
            { label: "Employed type", value: lookup(EMPLOYED_TYPE_MAP, employment.employedType) },
            { label: "OFW", value: yesNo(employment.isOfw) },
            { label: "4Ps beneficiary", value: yesNo(employment.is4PsBeneficiary) },
            { label: "Reason for unemployment", value: employment.unemployedReason },
            { label: "Job search duration", value: employment.jobSearchDuration, numeric: true },
          ]}
        />

        {/* III — Job Preference */}
        <NumeralSection
          numeral="III"
          title="Job preference"
          value="iii"
          fields={[
            { label: "Preferred employment type", value: lookup(EMPLOYMENT_TYPE_MAP, jobPref.employmentType) },
            { label: "Preferred occupation", value: jobPref.occupation1 },
            { label: "Second choice", value: jobPref.occupation2 },
            { label: "Third choice", value: jobPref.occupation3 },
            {
              label: "Local locations",
              value:
                [jobPref.localLocation1, jobPref.localLocation2, jobPref.localLocation3]
                  .filter(Boolean)
                  .join(", ") || undefined,
              span: 2,
            },
            {
              label: "Overseas locations",
              value:
                [jobPref.overseasLocation1, jobPref.overseasLocation2, jobPref.overseasLocation3]
                  .filter(Boolean)
                  .join(", ") || undefined,
              span: 2,
            },
          ]}
        />

        {/* IV — Language & Dialect Proficiency */}
        <NumeralSection
          numeral="IV"
          title="Language & dialect proficiency"
          value="iv"
          emptyWhen={!hasLanguageData}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">Language</th>
                  {LANG_COLS.map((c) => (
                    <th key={c} className="py-2 pr-4 font-normal capitalize">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {langGroups.map((g) => (
                  <tr key={g.name} className="border-t border-border">
                    <td className="py-2.5 pr-4 text-foreground">{g.name}</td>
                    {LANG_COLS.map((k) => (
                      <td key={k} className="py-2.5 pr-4 text-foreground">
                        {g.data?.[k] ? "Yes" : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NumeralSection>

        {/* V — Educational Background */}
        <NumeralSection
          numeral="V"
          title="Educational background"
          value="v"
          emptyWhen={eduItems.length === 0}
        >
          <ul className="space-y-5">
            {eduItems.map((item, i) => (
              <ListEntry
                key={i}
                title={item.course || item.level}
                meta={item.course ? item.level : undefined}
                trail={[item.last, item.grad].filter(Boolean).join(" – ") || undefined}
              />
            ))}
          </ul>
        </NumeralSection>

        {/* VI — Technical / Vocational & Other Training */}
        <NumeralSection
          numeral="VI"
          title="Technical / vocational & other training"
          value="vi"
          emptyWhen={trainingEntries.length === 0}
        >
          <ul className="space-y-5">
            {trainingEntries.map((entry, i) => (
              <ListEntry
                key={i}
                title={entry.course || "Untitled training"}
                meta={
                  [entry.institution, entry.hours ? `${entry.hours} hours` : undefined]
                    .filter(Boolean)
                    .join(" · ") || undefined
                }
                body={entry.skillsAcquired || undefined}
              />
            ))}
          </ul>
        </NumeralSection>

        {/* VII — Eligibility / Professional License */}
        <NumeralSection
          numeral="VII"
          title="Eligibility / professional license"
          value="vii"
          emptyWhen={csList.length === 0 && plList.length === 0}
        >
          <div className="space-y-8">
            {csList.length > 0 && (
              <EligibilityList
                title="Civil service"
                items={csList.map((cs) => ({
                  name: cs.name!,
                  trail: cs.dateTaken ? (formatDate(cs.dateTaken) ?? cs.dateTaken) : undefined,
                }))}
              />
            )}
            {plList.length > 0 && (
              <EligibilityList
                title="Professional license"
                items={plList.map((pl) => ({
                  name: pl.name!,
                  trail: pl.validUntil
                    ? `Valid until ${formatDate(pl.validUntil) ?? pl.validUntil}`
                    : undefined,
                }))}
              />
            )}
          </div>
        </NumeralSection>

        {/* VIII — Work Experience (last 10 years) */}
        <NumeralSection
          numeral="VIII"
          title="Work experience"
          value="viii"
          emptyWhen={workEntries.length === 0}
        >
          <ul className="space-y-5">
            {workEntries.map((w, i) => (
              <ListEntry
                key={i}
                title={w.position || "Untitled position"}
                meta={[w.companyName, w.address].filter(Boolean).join(" · ") || undefined}
                body={
                  w.employmentStatus
                    ? w.employmentStatus.replace("_", " ").toLowerCase()
                    : undefined
                }
                trail={w.numberOfMonths ? `${w.numberOfMonths} mo` : undefined}
              />
            ))}
          </ul>
        </NumeralSection>

        {/* IX — Other Skills (without certificate) */}
        <NumeralSection
          numeral="IX"
          title="Other skills"
          value="ix"
          emptyWhen={otherSkillsList.length === 0}
        >
          <p className="text-[14px] leading-relaxed text-foreground">
            {otherSkillsList.join(" · ")}
          </p>
        </NumeralSection>

        {/* X — Certification / Authorization */}
        <NumeralSection
          numeral="X"
          title="Certification / authorization"
          value="x"
          fields={[
            { label: "Acknowledgement", value: certification.acknowledged ? "Acknowledged" : undefined },
            { label: "Signed by", value: certification.signature || undefined },
            {
              label: "Date signed",
              value: formatDate(certification.dateSigned) ?? (certification.dateSigned || undefined),
              numeric: true,
            },
          ]}
        />

        {/* XI — For Use of PESO Only */}
        <NumeralSection
          numeral="XI"
          title="For use of PESO only"
          value="xi"
          fields={[
            {
              label: "Referral programs",
              value: referralList.length ? referralList.join(", ") : undefined,
              span: 3,
            },
            { label: "Assessed by", value: pesoUse.assessedBy },
            { label: "Assessor signature", value: pesoUse.assessorSignature },
            {
              label: "Assessment date",
              value: formatDate(pesoUse.assessmentDate) ?? pesoUse.assessmentDate,
              numeric: true,
            },
          ]}
        />
      </Accordion>
    </article>
  );
}

function EligibilityList({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; trail?: string }>;
}) {
  return (
    <div>
      <h3 className="font-serif text-[15px] font-medium tracking-tight text-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
          >
            <span className="text-[14px] text-foreground">{item.name}</span>
            {item.trail && (
              <span data-tabular className={META_TEXT}>{item.trail}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
