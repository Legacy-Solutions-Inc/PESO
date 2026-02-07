"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/login/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const SIDEBAR_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/jobseekers/register", label: "Jobseeker Registration", icon: UserPlus, adminOnly: false },
  { href: "/jobseekers", label: "Jobseeker Records", icon: FolderOpen, adminOnly: false },
  { href: "/users", label: "User Management", icon: Users, adminOnly: true },
] as const;

const INITIALS_MAX_LENGTH = 2;

function getInitialsFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  if (localPart.length >= INITIALS_MAX_LENGTH) {
    return localPart.slice(0, INITIALS_MAX_LENGTH).toUpperCase();
  }
  return localPart.slice(0, 1).toUpperCase();
}

export interface DashboardShellProps {
  userEmail: string;
  userRole: "admin" | "encoder";
  children: React.ReactNode;
}

export function DashboardShell({ userEmail, userRole, children }: DashboardShellProps) {
  const pathname = usePathname();

  const sidebarWidth = "18rem"; // w-72: must match --sidebar-width so gap and fixed sidebar align (no overlap)

  return (
    <SidebarProvider style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}>
      <Sidebar
        className="flex flex-col border-r border-slate-200/80 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900"
        variant="sidebar"
      >
        <SidebarHeader className="flex h-16 flex-row items-center gap-3 border-b border-slate-200/80 px-6 dark:border-slate-700/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dashboard-primary text-white shadow-sm">
            <BarChart3 className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold leading-tight text-slate-900 dark:text-white">
              PESO Lambunao
            </h2>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dashboard System
            </p>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-6">
          <SidebarGroup>
            <SidebarGroupLabel className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {SIDEBAR_NAV_ITEMS.filter(item => !item.adminOnly || userRole === "admin").map(({ href, label, icon: Icon }) => {
                  const isDashboardActive = href === "/" && pathname === "/";
                  const isRegistrationActive =
                    href === "/jobseekers/register" &&
                    (pathname === "/jobseekers/register" || pathname.startsWith("/jobseekers/register/"));
                  const isRecordsActive =
                    href === "/jobseekers" &&
                    pathname.startsWith("/jobseekers") &&
                    !pathname.startsWith("/jobseekers/register");
                  const isUsersActive =
                    href === "/users" &&
                    pathname.startsWith("/users") &&
                    !pathname.startsWith("/users/pending");
                  const isActive = isDashboardActive || isRegistrationActive || isRecordsActive || isUsersActive;

                  return (
                    <SidebarMenuItem key={label}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          href !== "/" &&
                            "font-medium text-slate-600 hover:bg-slate-100 hover:text-dashboard-primary focus-visible:ring-2 focus-visible:ring-dashboard-primary dark:text-slate-300 dark:hover:bg-slate-800/50",
                          isActive &&
                            "bg-dashboard-primary font-semibold text-white shadow-sm"
                        )}
                      >
                        <Link href={href}>
                          <Icon className="size-5" aria-hidden />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-200/80 p-4 dark:border-slate-700/50">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <Avatar className="size-9 border border-slate-200 shadow-sm dark:border-slate-600">
              <AvatarFallback className="bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {getInitialsFromEmail(userEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                User
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {userEmail}
              </p>
            </div>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="size-8 text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-dashboard-primary"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden />
              </Button>
            </form>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="overflow-hidden">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <SidebarTrigger className="lg:hidden shrink-0" />
            <h1 className="hidden min-w-0 truncate text-lg font-bold text-slate-800 dark:text-white sm:block">
              NSRP Jobseeker Registration System
            </h1>
            <h1 className="min-w-0 truncate text-lg font-bold text-slate-800 dark:text-white sm:hidden">
              NSRP System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                placeholder="Quick search..."
                className="w-64 rounded-full border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm dark:border-slate-700 dark:bg-slate-800/80"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-slate-500 hover:text-dashboard-primary focus-visible:ring-2 focus-visible:ring-dashboard-primary"
              aria-label="Notifications"
            >
              <Bell className="size-5" aria-hidden />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" aria-hidden />
            </Button>
            <Separator orientation="vertical" className="hidden h-8 sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                PESO Lambunao
              </p>
              <p className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
                Region VI
              </p>
            </div>
          </div>
        </header>
        <main className="custom-scrollbar relative z-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-dashboard-surface p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
