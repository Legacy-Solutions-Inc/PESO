import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  Download,
  Filter,
  Heart,
  Search,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StatTrendDirection = boolean | null;

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  trendUp: StatTrendDirection;
  icon: React.ComponentType<{ className?: string }>;
}

interface RecentRegistrationRow {
  name: string;
  initials: string;
  sex: string;
  age: number;
  barangay: string;
  status: string;
  statusVariant: "emerald" | "amber" | "indigo";
  dateRegistered: string;
}

const DASHBOARD_STATS: DashboardStat[] = [
  {
    label: "Total Jobseekers",
    value: "12,450",
    trend: "+2.5%",
    trendUp: true,
    icon: Users,
  },
  {
    label: "New This Month",
    value: "342",
    trend: "+12%",
    trendUp: true,
    icon: UserPlus,
  },
  {
    label: "Employed",
    value: "8,120",
    trend: "+0.8%",
    trendUp: true,
    icon: Briefcase,
  },
  {
    label: "Unemployed",
    value: "3,890",
    trend: "-0.5%",
    trendUp: false,
    icon: UserX,
  },
  {
    label: "OFW / Former OFW",
    value: "1,240",
    trend: "0%",
    trendUp: null,
    icon: Plane,
  },
  {
    label: "4Ps Beneficiaries",
    value: "2,100",
    trend: "+1.2%",
    trendUp: true,
    icon: Heart,
  },
];

const RECENT_REGISTRATIONS_PLACEHOLDER: RecentRegistrationRow[] = [
  {
    name: "Juan Dela Cruz",
    initials: "JC",
    sex: "Male",
    age: 28,
    barangay: "Poblacion",
    status: "Unemployed",
    statusVariant: "amber" as const,
    dateRegistered: "Feb 5, 2025",
  },
  {
    name: "Maria Santos",
    initials: "MS",
    sex: "Female",
    age: 32,
    barangay: "Burgos",
    status: "Employed",
    statusVariant: "emerald" as const,
    dateRegistered: "Feb 4, 2025",
  },
  {
    name: "Pedro Reyes",
    initials: "PR",
    sex: "Male",
    age: 45,
    barangay: "Rizal",
    status: "OFW",
    statusVariant: "indigo" as const,
    dateRegistered: "Feb 3, 2025",
  },
  {
    name: "Ana Garcia",
    initials: "AG",
    sex: "Female",
    age: 24,
    barangay: "Luna",
    status: "Unemployed",
    statusVariant: "amber" as const,
    dateRegistered: "Feb 2, 2025",
  },
  {
    name: "Roberto Mendoza",
    initials: "RM",
    sex: "Male",
    age: 38,
    barangay: "Mabini",
    status: "Employed",
    statusVariant: "emerald" as const,
    dateRegistered: "Feb 1, 2025",
  },
];

type StatusBadgeVariant = "emerald" | "amber" | "indigo";

interface StatusBadgeProps {
  status: string;
  variant: StatusBadgeVariant;
}

function StatusBadge({ status, variant }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "emerald" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
        variant === "amber" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
        variant === "indigo" &&
          "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
      )}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList className="text-slate-500 dark:text-slate-400">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
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

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Overview of registration data and recent activity for Region III.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Last updated: Feb 7, 2025, 10:30 AM
        </div>
        <Button className="shrink-0 bg-dashboard-primary text-white hover:bg-dashboard-primary-hover focus-visible:ring-2 focus-visible:ring-dashboard-primary">
          <Download className="mr-2 size-4" aria-hidden />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {DASHBOARD_STATS.map(({ label, value, trend, trendUp, icon: Icon }) => (
          <Card
            key={label}
            className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6">
              <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {label}
              </CardTitle>
              <Icon className="size-4 text-slate-400" aria-hidden />
            </CardHeader>
            <CardContent className="pb-6">
              <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {value}
              </div>
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  trendUp === true && "text-emerald-600 dark:text-emerald-400",
                  trendUp === false && "text-red-600 dark:text-red-400",
                  trendUp === null && "text-slate-500 dark:text-slate-400"
                )}
              >
                {trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Jobseeker Registrations
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Latest entries in the jobseeker registry. Use search and filters to narrow results.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              placeholder="Search name or barangay…"
              className="border-slate-200 bg-white pl-9 dark:border-slate-700 dark:bg-slate-900/50"
            />
          </div>
          <Button variant="outline" size="icon" aria-label="Filter" className="shrink-0">
            <Filter className="size-4" aria-hidden />
          </Button>
        </div>

        <Card className="overflow-hidden border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-700">
                  <TableHead className="py-3 font-semibold text-slate-700 dark:text-slate-200">Name</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700 dark:text-slate-200">Sex</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700 dark:text-slate-200">Age</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700 dark:text-slate-200">Barangay</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700 dark:text-slate-200">Employment Status</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700 dark:text-slate-200">Date Registered</TableHead>
                  <TableHead className="py-3 text-right font-semibold text-slate-700 dark:text-slate-200">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_REGISTRATIONS_PLACEHOLDER.map((row) => (
                  <TableRow
                    key={row.name}
                    className="border-slate-200/80 dark:border-slate-700/80"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 shrink-0 border border-slate-200 dark:border-slate-600">
                          <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {row.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {row.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 dark:text-slate-300">
                      {row.sex}
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 dark:text-slate-300">
                      {row.age}
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 dark:text-slate-300">
                      {row.barangay}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={row.status} variant={row.statusVariant} />
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 dark:text-slate-300">
                      {row.dateRegistered}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <Link
                        href="#"
                        className="text-sm font-medium text-dashboard-primary hover:underline focus-visible:ring-2 focus-visible:ring-dashboard-primary focus-visible:ring-offset-2 focus-visible:outline-hidden"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200/80 px-6 py-4 dark:border-slate-700/80 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing 1 to 5 of 2,450 results
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" aria-disabled />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      </section>
    </div>
  );
}
