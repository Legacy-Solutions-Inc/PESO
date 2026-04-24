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
      <div className="space-y-6">
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Could not load dashboard data. Please try reloading the page, or contact your administrator if the problem continues.
        </p>
      </div>
    );
  }

  const stats = statsResult.data;
  const recentJobseekers = recentResult.data || [];

  const totalTrend = calculateTrend(stats.newThisMonth, stats.newLastMonth);

  const dashboardStats: Array<{
    label: string;
    value: string;
    trend: string;
    trendUp: boolean | null;
    icon: typeof Users;
  }> = [
    {
      label: "Total jobseekers",
      value: formatNumber(stats.totalJobseekers),
      trend: totalTrend.trend,
      trendUp: totalTrend.trendUp,
      icon: Users,
    },
    {
      label: "New this month",
      value: formatNumber(stats.newThisMonth),
      trend: totalTrend.trend,
      trendUp: totalTrend.trendUp,
      icon: UserPlus,
    },
    {
      label: "Employed",
      value: formatNumber(stats.employed),
      trend: "",
      trendUp: null,
      icon: Briefcase,
    },
    {
      label: "Unemployed",
      value: formatNumber(stats.unemployed),
      trend: "",
      trendUp: null,
      icon: UserX,
    },
    {
      label: "OFW / former OFW",
      value: formatNumber(stats.ofwCount),
      trend: "",
      trendUp: null,
      icon: Plane,
    },
    {
      label: "4Ps beneficiaries",
      value: formatNumber(stats.fourPsCount),
      trend: "",
      trendUp: null,
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList className="text-muted-foreground">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="hover:text-foreground">
                Main menu
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="size-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-foreground">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            System dashboard
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Overview of registration data and recent activity for Lambunao.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Updated at {formatTimestamp()}
        </p>
      </header>

      <section
        aria-label="Registration statistics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {dashboardStats.map(({ label, value, trend, trendUp, icon: Icon }) => (
          <Card
            key={label}
            className="border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </CardTitle>
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden
              />
            </CardHeader>
            <CardContent className="pb-5">
              <div
                data-tabular
                className="text-3xl font-medium text-foreground"
              >
                {value}
              </div>
              {trend && (
                <p
                  className={cn(
                    "mt-2 text-xs",
                    trendUp === true && "text-status-positive",
                    trendUp === false && "text-destructive",
                    trendUp === null && "text-muted-foreground"
                  )}
                >
                  {trend}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4" aria-labelledby="recent-heading">
        <div className="flex items-end justify-between">
          <div>
            <h2
              id="recent-heading"
              className="text-xl font-medium tracking-tight text-foreground"
            >
              Recent jobseeker registrations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest entries in the jobseeker registry.
            </p>
          </div>
          <Link
            href="/jobseekers"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all records
          </Link>
        </div>

        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/50">
                  <TableHead className="py-3 font-medium text-foreground">
                    Name
                  </TableHead>
                  <TableHead className="py-3 font-medium text-foreground">
                    Sex
                  </TableHead>
                  <TableHead className="py-3 font-medium text-foreground">
                    Age
                  </TableHead>
                  <TableHead className="py-3 font-medium text-foreground">
                    Barangay
                  </TableHead>
                  <TableHead className="py-3 font-medium text-foreground">
                    Employment status
                  </TableHead>
                  <TableHead className="py-3 font-medium text-foreground">
                    Date registered
                  </TableHead>
                  <TableHead className="py-3 text-right font-medium text-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobseekers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No recent registrations
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
                        className="border-border transition-colors hover:bg-accent/40"
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 shrink-0 border border-border">
                              <AvatarFallback className="bg-muted text-xs font-medium text-foreground">
                                {row.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                              {row.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-foreground">
                          {row.sex}
                        </TableCell>
                        <TableCell data-tabular className="py-3 text-foreground">
                          {row.age ?? "—"}
                        </TableCell>
                        <TableCell className="py-3 text-foreground">
                          {row.barangay}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                              statusTone === "positive" &&
                                "border-status-positive/30 bg-status-positive/10 text-status-positive",
                              statusTone === "warning" &&
                                "border-status-warning/30 bg-status-warning/10 text-status-warning",
                              statusTone === "muted" &&
                                "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            {row.employmentStatus}
                          </span>
                        </TableCell>
                        <TableCell data-tabular className="py-3 text-foreground">
                          {row.dateRegistered}
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Link
                            href={`/jobseekers/${row.id}`}
                            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
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

          <div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {recentJobseekers.length}
              </span>{" "}
              most recent of{" "}
              <span className="font-medium text-foreground">
                {formatNumber(stats.totalJobseekers)}
              </span>{" "}
              total jobseekers.
            </p>
            <Link
              href="/jobseekers"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              View all records
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
