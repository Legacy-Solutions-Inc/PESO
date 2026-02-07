import { Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: "admin" | "encoder";
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const isAdmin = role === "admin";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
        isAdmin
          ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-300"
          : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
        className
      )}
    >
      {isAdmin ? (
        <Shield className="h-3.5 w-3.5" />
      ) : (
        <User className="h-3.5 w-3.5" />
      )}
      {isAdmin ? "Admin" : "Encoder"}
    </span>
  );
}
