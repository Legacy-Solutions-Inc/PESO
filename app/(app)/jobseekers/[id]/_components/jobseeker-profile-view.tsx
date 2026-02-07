"use client";

import Link from "next/link";
import {
  User as UserIcon,
  Phone,
  Briefcase,
  Target,
  GraduationCap,
  Award,
  MapPin,
  Cake,
  Heart,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { JobseekerFullRecord } from "../../actions";

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function computeAge(dateOfBirth: string | undefined): number | null {
  if (!dateOfBirth) return null;
  try {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  } catch {
    return null;
  }
}

function formatSex(sex: string | undefined): string {
  if (!sex) return "—";
  return sex === "MALE" ? "Male" : sex === "FEMALE" ? "Female" : sex;
}

function formatCivilStatus(s: string | undefined): string {
  if (!s) return "—";
  const map: Record<string, string> = {
    SINGLE: "Single",
    MARRIED: "Married",
    WIDOWED: "Widowed",
    SEPARATED: "Separated",
  };
  return map[s] ?? s;
}

function formatEmploymentType(s: string | undefined): string {
  if (!s) return "—";
  return s === "PART_TIME" ? "Part Time" : s === "FULL_TIME" ? "Full Time" : s;
}

function formatEmploymentStatus(s: string | undefined): string {
  if (!s) return "—";
  return s === "EMPLOYED" ? "Employed" : s === "UNEMPLOYED" ? "Unemployed" : s;
}

function disabilitySummary(disability: Record<string, unknown> | undefined): string {
  if (!disability) return "None";
  const parts: string[] = [];
  if (disability.visual) parts.push("Visual");
  if (disability.hearing) parts.push("Hearing");
  if (disability.speech) parts.push("Speech");
  if (disability.physical) parts.push("Physical");
  if (disability.mental) parts.push("Mental");
  const others = disability.others as string | undefined;
  if (others) parts.push(others);
  return parts.length ? parts.join(", ") : "None";
}

function otherSkillsLabels(): Record<string, string> {
  return {
    auto_mechanic: "Auto Mechanic",
    beautician: "Beautician",
    carpentry_work: "Carpentry Work",
    computer_literate: "Computer Literate",
    domestic_chores: "Domestic Chores",
    driver: "Driver",
    electrician: "Electrician",
    embroidery: "Embroidery",
    gardening: "Gardening",
    masonry: "Masonry",
    painter_artist: "Painter/Artist",
    painting_jobs: "Painting Jobs",
    photography: "Photography",
    plumbing: "Plumbing",
    sewing_dresses: "Sewing Dresses",
    stenography: "Stenography",
    tailoring: "Tailoring",
  };
}

interface JobseekerProfileViewProps {
  record: JobseekerFullRecord;
}

export function JobseekerProfileView({ record }: JobseekerProfileViewProps) {
  const personalInfo = record.personal_info ?? {};
  const address = (personalInfo.address as Record<string, string> | undefined) ?? {};
  const employment = record.employment ?? {};
  const jobPref = record.job_preference ?? {};
  const education = record.education ?? {};
  const training = record.training ?? {};
  const eligibility = record.eligibility ?? {};
  const skills = record.skills ?? {};
  const otherSkills = (skills.otherSkills as Record<string, boolean | string> | undefined) ?? {};
  const certification = (skills.certification as Record<string, unknown> | undefined) ?? {};
  const fullName = [
    personalInfo.surname,
    personalInfo.firstName,
    personalInfo.middleName,
  ]
    .filter(Boolean)
    .join(" ");
  const age = computeAge(personalInfo.dateOfBirth as string | undefined);
  const addressLine = [address.houseStreet, address.barangay, address.city, address.province]
    .filter(Boolean)
    .join(", ") || "—";
  const shortAddress = [address.barangay, address.city].filter(Boolean).join(", ") || "—";

  const statusLabel =
    record.status === "active"
      ? "Active Profile"
      : record.status === "archived"
        ? "Archived"
        : "Pending";

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-700/50 dark:bg-slate-900/50 dark:shadow-none">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-dashboard-primary/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-slate-200/30 blur-2xl dark:bg-slate-600/10" />
        <div className="relative flex flex-col gap-8 p-8 sm:p-10 md:flex-row md:items-center md:gap-10">
          <div className="relative shrink-0">
            <Avatar className="h-28 w-28 ring-4 ring-slate-100 shadow-xl dark:ring-slate-800 sm:h-36 sm:w-36">
              <AvatarFallback className="bg-linear-to-br from-dashboard-primary/20 to-dashboard-primary/5 text-2xl font-semibold text-dashboard-primary sm:text-3xl">
                {personalInfo.surname?.[0] ?? ""}
                {personalInfo.firstName?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute bottom-0 right-0 h-6 w-6 rounded-full border-[3px] border-white shadow-sm dark:border-slate-900 ${
                record.status === "active"
                  ? "bg-emerald-500"
                  : record.status === "archived"
                    ? "bg-slate-400"
                    : "bg-amber-400"
              }`}
              title={statusLabel}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
                {fullName || "—"}
              </h1>
              <span className="inline-flex w-fit items-center rounded-full bg-dashboard-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-dashboard-primary dark:bg-dashboard-primary/20">
                {statusLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Cake, label: age != null ? `${age} years old` : "—" },
                { icon: UserIcon, label: formatSex(personalInfo.sex as string | undefined) },
                { icon: Heart, label: formatCivilStatus(personalInfo.civilStatus as string | undefined) },
                { icon: MapPin, label: shortAddress },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Icon className="size-4 text-slate-500 dark:text-slate-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row md:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-slate-200 bg-white font-medium shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 md:flex-none"
              asChild
            >
              <Link href="/jobseekers" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Records
              </Link>
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-2 bg-dashboard-primary font-semibold shadow-lg shadow-dashboard-primary/25 transition hover:bg-dashboard-primary/90 hover:shadow-xl hover:shadow-dashboard-primary/20 md:flex-none"
              asChild
            >
              <Link href={`/jobseekers/${record.id}/edit`}>
                <Pencil className="size-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Accordion
        type="single"
        defaultValue="personal"
        collapsible
        className="flex flex-col gap-5"
      >
        <AccordionItem
          value="personal"
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <AccordionTrigger className="px-6 py-6 text-left hover:no-underline data-[state=open]:bg-slate-50/80 dark:data-[state=open]:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-dashboard-primary/10 text-dashboard-primary">
                <UserIcon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Date of Birth
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {formatDate(personalInfo.dateOfBirth as string | undefined)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Place of Birth
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(personalInfo.placeOfBirth as string) || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Religion
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(personalInfo.religion as string) || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Civil Status
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {formatCivilStatus(personalInfo.civilStatus as string | undefined)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  TIN Number
                </p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(personalInfo.tin as string) || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Height
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(personalInfo.height as string) || "—"}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Disability
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {disabilitySummary(personalInfo.disability as Record<string, unknown> | undefined)}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="contact"
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <AccordionTrigger className="px-6 py-6 text-left hover:no-underline data-[state=open]:bg-slate-50/80 dark:data-[state=open]:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Phone className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Contact Details
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Mobile Number
                </p>
                <p className="font-mono text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(personalInfo.contactNumber as string) || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Email Address
                </p>
                <p className="text-sm font-medium text-dashboard-primary underline underline-offset-2">
                  {(personalInfo.email as string) || "—"}
                </p>
              </div>
              <div className="col-span-full">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Address
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {addressLine}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="employment"
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <AccordionTrigger className="px-6 py-6 text-left hover:no-underline data-[state=open]:bg-slate-50/80 dark:data-[state=open]:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Briefcase className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Employment Status
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Current Status
                </p>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                    employment.status === "EMPLOYED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  }`}
                >
                  {formatEmploymentStatus(employment.status as string | undefined)}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Employed Type
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {employment.employedType === "WAGE"
                    ? "Wage"
                    : employment.employedType === "SELF_EMPLOYED"
                      ? "Self-Employed"
                      : "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  OFW
                </p>
                <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {employment.isOfw ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  4Ps Beneficiary
                </p>
                <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {employment.is4PsBeneficiary ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Unemployed Reason
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(employment.unemployedReason as string) || "—"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Job Search Duration
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  {(employment.jobSearchDuration as string) || "—"}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="jobpref"
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <AccordionTrigger className="px-6 py-6 text-left hover:no-underline data-[state=open]:bg-slate-50/80 dark:data-[state=open]:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Target className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Job Preferences
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="flex flex-col gap-4">
              {[
                { label: "Preferred occupation", value: jobPref.occupation1 },
                { label: "Second choice", value: jobPref.occupation2 },
                { label: "Third choice", value: jobPref.occupation3 },
              ].map(
                (item, i) =>
                  item.value && (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-100 bg-white/40 p-3 dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {item.label}
                      </p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  )
              )}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Preferred employment type
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    {formatEmploymentType(jobPref.employmentType as string | undefined)}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Local locations
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    {[jobPref.localLocation1, jobPref.localLocation2, jobPref.localLocation3]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Overseas locations
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                    {[
                      jobPref.overseasLocation1,
                      jobPref.overseasLocation2,
                      jobPref.overseasLocation3,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="education"
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <AccordionTrigger className="px-6 py-6 text-left hover:no-underline data-[state=open]:bg-slate-50/80 dark:data-[state=open]:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <GraduationCap className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Educational Background
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="relative space-y-6 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
              {[
                {
                  level: "Tertiary",
                  course: (education.tertiary as Record<string, string> | undefined)?.course,
                  yearGraduated: (education.tertiary as Record<string, string> | undefined)?.yearGraduated,
                  yearLastAttended: (education.tertiary as Record<string, string> | undefined)?.yearLastAttended,
                },
                {
                  level: "Senior High",
                  course: (education.seniorHigh as Record<string, string> | undefined)?.strand,
                  yearGraduated: (education.seniorHigh as Record<string, string> | undefined)?.yearGraduated,
                  yearLastAttended: (education.seniorHigh as Record<string, string> | undefined)?.yearLastAttended,
                },
                {
                  level: "Secondary",
                  course: undefined,
                  yearGraduated: (education.secondary as Record<string, string> | undefined)?.yearGraduated,
                  yearLastAttended: (education.secondary as Record<string, string> | undefined)?.yearLastAttended,
                },
                {
                  level: "Elementary",
                  course: undefined,
                  yearGraduated: (education.elementary as Record<string, string> | undefined)?.yearGraduated,
                  yearLastAttended: (education.elementary as Record<string, string> | undefined)?.yearLastAttended,
                },
                {
                  level: "Graduate",
                  course: (education.graduate as Record<string, string> | undefined)?.course,
                  yearGraduated: (education.graduate as Record<string, string> | undefined)?.yearGraduated,
                  yearLastAttended: (education.graduate as Record<string, string> | undefined)?.yearLastAttended,
                },
              ].map(
                (item, i) =>
                  (item.course || item.yearGraduated || item.yearLastAttended) && (
                    <div key={i} className="relative">
                      <div className="absolute -left-5.25 top-1 h-3 w-3 rounded-full border-2 border-white bg-dashboard-primary dark:border-slate-900" />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            {item.course || item.level}
                          </h4>
                          <p className="text-sm text-slate-500">{item.level}</p>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-1 text-sm font-medium text-slate-500 dark:bg-slate-800">
                          {[item.yearLastAttended, item.yearGraduated].filter(Boolean).join(" – ") || "—"}
                        </span>
                      </div>
                    </div>
                  )
              )}
              {!(education as Record<string, unknown>).tertiary &&
                !(education as Record<string, unknown>).seniorHigh &&
                !(education as Record<string, unknown>).secondary &&
                !(education as Record<string, unknown>).elementary &&
                !(education as Record<string, unknown>).graduate && (
                  <p className="text-sm text-slate-500">No education recorded.</p>
                )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="skills"
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <AccordionTrigger className="px-6 py-6 text-left hover:no-underline data-[state=open]:bg-slate-50/80 dark:data-[state=open]:bg-slate-800/30">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                <Award className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Skills & Certifications
              </h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-slate-100 bg-slate-50/50 px-6 pb-6 pt-4 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Other skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(otherSkillsLabels()).map(([key, label]) =>
                    otherSkills[key] ? (
                      <span
                        key={key}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      >
                        {label}
                      </span>
                    ) : null
                  )}
                  {otherSkills.others && (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {String(otherSkills.others)}
                    </span>
                  )}
                  {!Object.keys(otherSkills).some((k) => otherSkills[k] && k !== "others") &&
                    !otherSkills.others && (
                      <span className="text-sm text-slate-500">None listed.</span>
                    )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Training
                </p>
                {(training.entries as Array<Record<string, unknown>> | undefined)?.length ? (
                  <ul className="space-y-2">
                    {(training.entries as Array<Record<string, unknown>>).map((entry, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-slate-100 bg-white/40 p-3 dark:border-slate-700 dark:bg-slate-800/40"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {(entry.course as string) || "—"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {(entry.institution as string) && `${entry.institution}`}
                          {(entry.hours as string) && ` • ${entry.hours} hrs`}
                        </p>
                        {(entry.skillsAcquired as string) && (
                          <p className="mt-1 text-sm text-slate-500">
                            {entry.skillsAcquired as string}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No training recorded.</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Eligibility / Licenses
                </p>
                {((eligibility.civilService as unknown[])?.length ||
                  (eligibility.professionalLicense as unknown[])?.length) ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {(eligibility.civilService as Array<Record<string, string>>)?.map((cs, i) => (
                      <div key={i} className="rounded border border-slate-100 p-2 dark:border-slate-700">
                        <p className="font-medium">{cs.name || "—"}</p>
                        <p className="text-xs text-slate-500">{cs.dateTaken || ""}</p>
                      </div>
                    ))}
                    {(eligibility.professionalLicense as Array<Record<string, string>>)?.map((pl, i) => (
                      <div key={i} className="rounded border border-slate-100 p-2 dark:border-slate-700">
                        <p className="font-medium">{pl.name || "—"}</p>
                        <p className="text-xs text-slate-500">Valid until: {pl.validUntil || "—"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">None recorded.</p>
                )}
              </div>
              {(certification.signature as string) && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Certification
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Signed {formatDate(certification.dateSigned as string)}
                  </p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
