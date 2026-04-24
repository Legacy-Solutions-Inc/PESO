import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface HairlineIconProps extends Omit<LucideProps, "ref"> {
  icon: LucideIcon;
}

export function HairlineIcon({
  icon: Icon,
  className,
  strokeWidth = 1.25,
  ...props
}: HairlineIconProps) {
  return (
    <Icon
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    />
  );
}
