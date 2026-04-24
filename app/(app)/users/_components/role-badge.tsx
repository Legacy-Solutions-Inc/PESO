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
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        isAdmin
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      {isAdmin ? (
        <Shield className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <User className="h-3.5 w-3.5" aria-hidden />
      )}
      {isAdmin ? "Admin" : "Encoder"}
    </span>
  );
}
