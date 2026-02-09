import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  Heart,
  UserPlus,
  Users,
  UserX,
  Plane,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getDashboardStats,
  getRecentJobseekers,
} from "./jobseekers/actions";

function calculateTrend(
  current: number,
  previous: number
): { trend: string; trendUp: boolean | null } {
  if (previous === 0) {
    if (current === 0) return { trend: "—", trendUp: null };
    return { trend: "+100%", trendUp: true };
  }
  const percent = ((current - previous) / previous) * 100;
  const sign = percent > 0 ? "+" : "";
  return {
    trend: `${sign}${percent.toFixed(1)}%`,
    trendUp: percent > 0 ? true : percent < 0 ? false : null,
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export default async function DashboardPage() {
  const [statsResult, recentResult] = await Promise.all([
    getDashboardStats(),
    getRecentJobseekers(10),
  ]);

  // Show error state if stats fail
  if (statsResult.error || !statsResult.data) {
    return (
      <div className="space-y-6">
        <p className="text-red-500">
          Error loading dashboard: {statsResult.error}
        </p>
      </div>
    );
  }

  const stats = statsResult.data;
  const recentJobseekers = recentResult.data || [];

  // Calculate trends for cards that have previous month data
  const totalTrend = calculateTrend(stats.newThisMonth, stats.newLastMonth);
  const newThisMonthTrend = calculateTrend(stats.newThisMonth, stats.newLastMonth);

  const dashboardStats = [
    {
      label: "Total Jobseekers",
      value: formatNumber(stats.totalJobseekers),
      trend: totalTrend.trend,
      trendUp: totalTrend.trendUp,
      icon: Users,
      color: "blue",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "New This Month",
      value: formatNumber(stats.newThisMonth),
      trend: newThisMonthTrend.trend,
      trendUp: newThisMonthTrend.trendUp,
      icon: UserPlus,
      color: "purple",
      bgGradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Employed",
      value: formatNumber(stats.employed),
      trend: "—",
      trendUp: null,
      icon: Briefcase,
      color: "emerald",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Unemployed",
      value: formatNumber(stats.unemployed),
      trend: "—",
      trendUp: null,
      icon: UserX,
      color: "amber",
      bgGradient: "from-amber-50 to-amber-100/50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "OFW / Former OFW",
      value: formatNumber(stats.ofwCount),
      trend: "—",
      trendUp: null,
      icon: Plane,
      color: "cyan",
      bgGradient: "from-cyan-50 to-cyan-100/50",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      label: "4Ps Beneficiaries",
      value: formatNumber(stats.fourPsCount),
      trend: "—",
      trendUp: null,
      icon: Heart,
      color: "rose",
      bgGradient: "from-rose-50 to-rose-100/50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList className="text-slate-500 dark:text-slate-400">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Main Menu
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="size-3.5 text-slate-400" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-slate-700 dark:text-slate-200">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Dashboard
          </h1>
          <p className="mt-1.5 text-base text-slate-600 dark:text-slate-400">
            Overview of registration data and recent activity for Lambunao.
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Live Data
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {dashboardStats.map(({ label, value, trend, trendUp, icon: Icon, bgGradient, iconBg, iconColor }) => (
          <Card
            key={label}
            className="group relative overflow-hidden border-0 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/80 transition-all hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 dark:bg-slate-900/50 dark:shadow-none dark:ring-slate-700/50"
          >
            <div className={cn("absolute inset-0 bg-linear-to-br opacity-30 dark:opacity-20", bgGradient)} />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {label}
              </CardTitle>
              <div className={cn("flex size-9 items-center justify-center rounded-lg", iconBg)}>
                <Icon className={cn("size-5", iconColor)} aria-hidden />
              </div>
            </CardHeader>
            <CardContent className="relative pb-5">
              <div className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {value}
              </div>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs font-semibold",
                  trendUp === true && "text-emerald-600 dark:text-emerald-400",
                  trendUp === false && "text-red-600 dark:text-red-400",
                  trendUp === null && "text-slate-500 dark:text-slate-400"
                )}
              >
                <span>{trend}</span>
                <span className="font-normal">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Jobseeker Registrations
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Latest entries in the jobseeker registry.
            </p>
          </div>
          <Link
            href="/jobseekers"
            className="text-sm font-semibold text-dashboard-primary hover:text-dashboard-primary/80 hover:underline"
          >
            View all records →
          </Link>
        </div>

        <Card className="overflow-hidden border-0 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/80 dark:bg-slate-900/50 dark:shadow-none dark:ring-slate-700/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/50 dark:border-slate-700/80 dark:bg-slate-800/30">
                  <TableHead className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    Name
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    Sex
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    Age
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    Barangay
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    Employment Status
                  </TableHead>
                  <TableHead className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                    Date Registered
                  </TableHead>
                  <TableHead className="py-3.5 text-right font-bold text-slate-900 dark:text-slate-100">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobseekers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-slate-500"
                    >
                      No recent registrations
                    </TableCell>
                  </TableRow>
                ) : (
                  recentJobseekers.map((row) => {
                    const statusVariant =
                      row.employmentStatus === "Employed"
                        ? "emerald"
                        : row.employmentStatus === "Unemployed"
                          ? "amber"
                          : "slate";

                    return (
                      <TableRow
                        key={row.id}
                        className="border-slate-200/60 transition-colors hover:bg-slate-50/50 dark:border-slate-700/60 dark:hover:bg-slate-800/30"
                      >
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 shrink-0 border-2 border-slate-200 shadow-sm dark:border-slate-600">
                              <AvatarFallback className="bg-linear-to-br from-blue-100 to-purple-100 text-xs font-bold text-slate-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-slate-200">
                                {row.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {row.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {row.sex}
                        </TableCell>
                        <TableCell className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {row.age ?? "—"}
                        </TableCell>
                        <TableCell className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {row.barangay}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ring-1",
                              statusVariant === "emerald" &&
                                "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-800",
                              statusVariant === "amber" &&
                                "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-800",
                              statusVariant === "slate" &&
                                "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:ring-slate-700"
                            )}
                          >
                            {row.employmentStatus}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 font-medium text-slate-700 dark:text-slate-300">
                          {row.dateRegistered}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <Link
                            href={`/jobseekers/${row.id}`}
                            className="inline-flex items-center rounded-lg bg-dashboard-primary/10 px-3 py-1.5 text-xs font-bold text-dashboard-primary ring-1 ring-dashboard-primary/20 transition-all hover:bg-dashboard-primary hover:text-white hover:shadow-md hover:shadow-dashboard-primary/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-dashboard-primary focus-visible:ring-offset-2"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200/80 bg-slate-50/30 px-6 py-4 dark:border-slate-700/80 dark:bg-slate-800/20 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{recentJobseekers.length}</span> most recent of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{formatNumber(stats.totalJobseekers)}</span> total jobseekers
            </p>
            <Link
              href="/jobseekers"
              className="text-sm font-semibold text-dashboard-primary hover:text-dashboard-primary/80 hover:underline"
            >
              View all records →
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
