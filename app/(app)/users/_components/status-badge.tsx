import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "pending" | "inactive";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        status === "active" &&
          "border-status-positive/30 bg-status-positive/10 text-status-positive",
        status === "pending" &&
          "border-status-warning/30 bg-status-warning/10 text-status-warning",
        status === "inactive" && "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" && "bg-status-positive",
          status === "pending" && "bg-status-warning",
          status === "inactive" && "bg-muted-foreground"
        )}
      />
      {status === "active" && "Active"}
      {status === "pending" && "Pending"}
      {status === "inactive" && "Inactive"}
    </span>
  );
}
