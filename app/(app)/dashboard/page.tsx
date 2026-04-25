import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Clock,
  Heart,
  Plane,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BezelSurface } from "@/components/vanguard/bezel-surface";
import { EyebrowTag } from "@/components/vanguard/eyebrow-tag";
import { HairlineIcon } from "@/components/vanguard/hairline-icon";
import { PillLink } from "@/components/vanguard/pill-cta";
import { Reveal } from "@/components/vanguard/reveal";
import {
  getDashboardStats,
  getRecentJobseekers,
} from "../jobseekers/actions";

function calculateTrend(
  current: number,
  previous: number,
): { trend: string; trendUp: boolean | null } {
  if (previous === 0) {
    if (current === 0) return { trend: "No change", trendUp: null };
    return { trend: "New this month", trendUp: null };
  }
  const percent = ((current - previous) / previous) * 100;
  const sign = percent > 0 ? "+" : "";
  return {
    trend: `${sign}${percent.toFixed(1)}% vs last month`,
    trendUp: percent > 0 ? true : percent < 0 ? false : null,
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-PH");
}

function formatTimestamp(): string {
  return new Date().toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function DashboardPage() {
  const [statsResult, recentResult] = await Promise.all([
    getDashboardStats(),
    getRecentJobseekers(10),
  ]);

  if (statsResult.error || !statsResult.data) {
    return (
      <div className="space-y-8">
        <BezelSurface
          radius="xl"
          shellPadding="1.5"
          innerClassName="px-6 py-5"
          tone="card"
        >
          <p
            role="alert"
            className="flex items-start gap-3 text-[14px] text-destructive"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/[0.08]">
              <HairlineIcon
                icon={TrendingDown}
                className="size-3.5 text-destructive"
              />
            </span>
            Could not load dashboard data. Please try reloading the page, or
            contact your administrator if the problem continues.
          </p>
        </BezelSurface>
      </div>
    );
  }

  const stats = statsResult.data;
  const recentJobseekers = recentResult.data || [];
  const totalTrend = calculateTrend(stats.newThisMonth, stats.newLastMonth);

  return (
    <div className="space-y-12 pb-12">
      {/* —— Breadcrumb + page header —— */}
      <div className="space-y-8 pt-4">
        <Breadcrumb>
          <BreadcrumbList className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/dashboard"
                  className="transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
                >
                  Main menu
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <HairlineIcon icon={ChevronRight} className="size-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Reveal>
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <EyebrowTag tone="primary" dot>
                System overview
              </EyebrowTag>
              <h1 className="mt-5 font-serif text-[clamp(2.25rem,4.2vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-foreground">
                Lambunao’s
                <span className="block text-foreground/55">
                  jobseeker registry.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Registration momentum, employment composition, and the most
                recent entries across every barangay — in a single glance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                data-tabular
                className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground ring-1 ring-inset ring-foreground/[0.06]"
              >
                <HairlineIcon icon={Clock} className="size-3" />
                Updated {formatTimestamp()}
              </span>
              <PillLink
                href="/jobseekers/register"
                variant="primary"
                size="md"
                icon={ArrowUpRight}
              >
                Register jobseeker
              </PillLink>
            </div>
          </header>
        </Reveal>
      </div>

      {/* —— Asymmetrical Bento: hero stat + 6 breakdowns —— */}
      <section
        aria-label="Registration statistics"
        className="grid grid-cols-1 gap-5 md:grid-cols-12 md:auto-rows-[minmax(0,auto)]"
      >
        {/* Hero card: Total jobseekers — spans 7/12, row-span-2 */}
        <Reveal delay={40} className="md:col-span-7 md:row-span-2">
          <BezelSurface
            radius="2xl"
            shellPadding="2"
            glow
            innerClassName="relative overflow-hidden p-8 sm:p-10"
          >
            {/* decorative mesh inside the core */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-[360px] rounded-full opacity-80 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklch, var(--primary) 15%, transparent), transparent 70%)",
              }}
            />
            <div className="relative flex flex-col gap-8">
              <div className="flex items-center justify-between gap-4">
                <EyebrowTag tone="primary" dot>
                  Total jobseekers
                </EyebrowTag>
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/[0.08] text-primary ring-1 ring-inset ring-primary/15">
                  <HairlineIcon icon={Users} className="size-4" />
                </span>
              </div>

              <div>
                <p
                  data-tabular
                  className="font-serif text-[clamp(3.75rem,8vw,6.25rem)] font-medium leading-[0.95] tracking-[-0.035em] text-foreground"
                >
                  {formatNumber(stats.totalJobseekers)}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
                  <TrendPill
                    value={totalTrend.trend}
                    direction={totalTrend.trendUp}
                  />
                  <span className="text-muted-foreground">
                    across all barangays
                  </span>
                </div>
              </div>

              <dl className="mt-2 grid grid-cols-3 gap-3 border-t border-foreground/[0.06] pt-6">
                <MiniStat
                  label="Employed"
                  value={formatNumber(stats.employed)}
                  tone="positive"
                />
                <MiniStat
                  label="Unemployed"
                  value={formatNumber(stats.unemployed)}
                  tone="warning"
                />
                <MiniStat
                  label="New this month"
                  value={formatNumber(stats.newThisMonth)}
                  tone="neutral"
                />
              </dl>
            </div>
          </BezelSurface>
        </Reveal>

        {/* Right column stacked duo */}
        <Reveal delay={100} className="md:col-span-5">
          <StatBento
            label="New this month"
            value={formatNumber(stats.newThisMonth)}
            icon={UserPlus}
            footer={
              <TrendPill
                value={totalTrend.trend}
                direction={totalTrend.trendUp}
              />
            }
          />
        </Reveal>
        <Reveal delay={140} className="md:col-span-5">
          <StatBento
            label="Employed"
            value={formatNumber(stats.employed)}
            icon={Briefcase}
            accent="positive"
            footer={
              <span className="text-[12px] text-muted-foreground">
                Currently employed jobseekers
              </span>
            }
          />
        </Reveal>

        {/* Bottom row trio */}
        <Reveal delay={180} className="md:col-span-4">
          <StatBento
            label="Unemployed"
            value={formatNumber(stats.unemployed)}
            icon={UserX}
            accent="warning"
            footer={
              <span className="text-[12px] text-muted-foreground">
                Actively seeking work
              </span>
            }
          />
        </Reveal>
        <Reveal delay={220} className="md:col-span-4">
          <StatBento
            label="OFW / former OFW"
            value={formatNumber(stats.ofwCount)}
            icon={Plane}
            footer={
              <span className="text-[12px] text-muted-foreground">
                Overseas Filipino workers
              </span>
            }
          />
        </Reveal>
        <Reveal delay={260} className="md:col-span-4">
          <StatBento
            label="4Ps beneficiaries"
            value={formatNumber(stats.fourPsCount)}
            icon={Heart}
            accent="info"
            footer={
              <span className="text-[12px] text-muted-foreground">
                Pantawid Pamilyang Pilipino
              </span>
            }
          />
        </Reveal>
      </section>

      {/* —— Recent registrations —— */}
      <section className="space-y-6" aria-labelledby="recent-heading">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <EyebrowTag className="mb-4">Activity</EyebrowTag>
              <h2
                id="recent-heading"
                className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] font-medium leading-tight tracking-[-0.02em] text-foreground"
              >
                Recent registrations
              </h2>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Ten most recent entries. Open a record to view the full profile.
              </p>
            </div>
            <Link
              href="/jobseekers"
              className="group inline-flex items-center gap-2 text-[13px] font-medium text-foreground/80 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
            >
              View all records
              <span className="flex size-6 items-center justify-center rounded-full bg-foreground/[0.05] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]">
                <HairlineIcon icon={ArrowUpRight} className="size-3" />
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <BezelSurface
            radius="2xl"
            shellPadding="1.5"
            innerClassName="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-foreground/[0.06] bg-foreground/[0.02] hover:bg-foreground/[0.02]">
                    {[
                      "Name",
                      "Sex",
                      "Age",
                      "Barangay",
                      "Employment",
                      "Registered",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {h}
                      </TableHead>
                    ))}
                    <TableHead className="py-3.5 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobseekers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-16 text-center text-muted-foreground"
                      >
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-full bg-foreground/[0.04]">
                            <HairlineIcon icon={Users} className="size-4" />
                          </span>
                          <p className="text-[14px]">No recent registrations yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentJobseekers.map((row) => {
                      const statusTone: "positive" | "warning" | "muted" =
                        row.employmentStatus === "Employed"
                          ? "positive"
                          : row.employmentStatus === "Unemployed"
                            ? "warning"
                            : "muted";

                      return (
                        <TableRow
                          key={row.id}
                          className="border-foreground/[0.05] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/[0.025]"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 shrink-0 ring-1 ring-inset ring-foreground/10">
                                <AvatarFallback className="bg-foreground/[0.04] text-[11px] font-medium text-foreground">
                                  {row.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">
                                {row.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-foreground/85">
                            {row.sex}
                          </TableCell>
                          <TableCell
                            data-tabular
                            className="py-4 text-foreground/85"
                          >
                            {row.age ?? "—"}
                          </TableCell>
                          <TableCell className="py-4 text-foreground/85">
                            {row.barangay}
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                                statusTone === "positive" &&
                                "bg-status-positive/10 text-status-positive ring-status-positive/20",
                                statusTone === "warning" &&
                                "bg-status-warning/12 text-status-warning ring-status-warning/25",
                                statusTone === "muted" &&
                                "bg-foreground/[0.04] text-muted-foreground ring-foreground/[0.06]",
                              )}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "size-1 rounded-full",
                                  statusTone === "positive" &&
                                  "bg-status-positive",
                                  statusTone === "warning" &&
                                  "bg-status-warning",
                                  statusTone === "muted" && "bg-muted-foreground",
                                )}
                              />
                              {row.employmentStatus}
                            </span>
                          </TableCell>
                          <TableCell
                            data-tabular
                            className="py-4 text-foreground/85"
                          >
                            {row.dateRegistered}
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <Link
                              href={`/jobseekers/${row.id}`}
                              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/75 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
                            >
                              View
                              <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.05] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]">
                                <HairlineIcon icon={ChevronRight} className="size-3" />
                              </span>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t border-foreground/[0.06] bg-foreground/[0.015] px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] text-muted-foreground">
                Showing{" "}
                <span
                  data-tabular
                  className="font-medium text-foreground"
                >
                  {recentJobseekers.length}
                </span>{" "}
                most recent of{" "}
                <span data-tabular className="font-medium text-foreground">
                  {formatNumber(stats.totalJobseekers)}
                </span>{" "}
                total.
              </p>
              <Link
                href="/jobseekers"
                className="group inline-flex items-center gap-2 text-[12.5px] font-medium text-foreground/75 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
              >
                Browse full registry
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground/[0.05] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-[1px] group-hover:translate-x-[2px]">
                  <HairlineIcon icon={ArrowUpRight} className="size-3" />
                </span>
              </Link>
            </div>
          </BezelSurface>
        </Reveal>
      </section>
    </div>
  );
}

/* ————————————————— local presentational helpers ————————————————— */

function StatBento({
  label,
  value,
  icon: Icon,
  footer,
  accent = "neutral",
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof HairlineIcon>["icon"];
  footer?: React.ReactNode;
  accent?: "neutral" | "positive" | "warning" | "info";
}) {
  const accentTone: Record<NonNullable<typeof accent>, string> = {
    neutral: "bg-foreground/[0.05] text-foreground",
    positive: "bg-status-positive/[0.1] text-status-positive",
    warning: "bg-status-warning/[0.12] text-status-warning",
    info: "bg-status-info/[0.1] text-status-info",
  };

  return (
    <BezelSurface
      radius="2xl"
      shellPadding="1.5"
      innerClassName="flex h-full flex-col justify-between gap-6 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <EyebrowTag>{label}</EyebrowTag>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full ring-1 ring-inset ring-foreground/[0.06]",
            accentTone[accent],
          )}
        >
          <HairlineIcon icon={Icon} className="size-4" />
        </span>
      </div>
      <div>
        <p
          data-tabular
          className="font-serif text-[clamp(2rem,3.2vw,2.75rem)] font-medium leading-none tracking-[-0.025em] text-foreground"
        >
          {value}
        </p>
        {footer ? <div className="mt-3">{footer}</div> : null}
      </div>
    </BezelSurface>
  );
}

function MiniStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "warning";
}) {
  const accent: Record<NonNullable<typeof tone>, string> = {
    neutral: "bg-foreground/40",
    positive: "bg-status-positive",
    warning: "bg-status-warning",
  };

  return (
    <div>
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span
          aria-hidden
          className={cn("size-1 rounded-full", accent[tone])}
        />
        {label}
      </span>
      <p
        data-tabular
        className="mt-1.5 font-serif text-[1.5rem] font-medium leading-none tracking-[-0.02em] text-foreground"
      >
        {value}
      </p>
    </div>
  );
}

function TrendPill({
  value,
  direction,
}: {
  value: string;
  direction: boolean | null;
}) {
  const Icon = direction === true ? TrendingUp : direction === false ? TrendingDown : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ring-1 ring-inset",
        direction === true &&
        "bg-status-positive/10 text-status-positive ring-status-positive/20",
        direction === false &&
        "bg-destructive/[0.08] text-destructive ring-destructive/15",
        direction === null &&
        "bg-foreground/[0.04] text-muted-foreground ring-foreground/[0.06]",
      )}
    >
      {Icon ? <HairlineIcon icon={Icon} className="size-3" /> : null}
      {value}
    </span>
  );
}
