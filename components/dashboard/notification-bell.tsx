"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface NotificationBellProps {
  pendingUserCount: number;
  userRole: "admin" | "encoder";
}

export function NotificationBell({
  pendingUserCount,
  userRole,
}: NotificationBellProps) {
  const showBadge = userRole === "admin" && pendingUserCount > 0;
  const hasItems = userRole === "admin" && pendingUserCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11 rounded-full text-slate-500 hover:text-dashboard-primary focus-visible:ring-2 focus-visible:ring-dashboard-primary"
          aria-label="Notifications"
        >
          <Bell className="size-5" aria-hidden />
          {showBadge && (
            <span
              className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900"
              aria-hidden
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        {hasItems ? (
          <DropdownMenuItem asChild>
            <Link
              href="/users?status=pending"
              className="min-h-11 cursor-pointer py-2"
            >
              {pendingUserCount} user(s) pending approval
            </Link>
          </DropdownMenuItem>
        ) : (
          <div className="px-2 py-3 text-sm text-slate-500 dark:text-slate-400">
            No new notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
