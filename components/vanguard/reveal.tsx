"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  delay?: number;
  /** Vertical translate amount, in px. Default 24. */
  offsetY?: number;
  /** Blur amount (px) while hidden. Default 8. */
  blur?: number;
  /** Viewport threshold, 0..1. Default 0.15. */
  threshold?: number;
  /** Re-trigger on re-entry (default false — once only). */
  repeat?: boolean;
}

export function Reveal({
  as: Component = "div",
  delay = 0,
  offsetY = 24,
  blur = 8,
  threshold = 0.15,
  repeat = false,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, repeat]);

  return (
    <Component
      ref={ref}
      style={{
        transform: visible ? "translateY(0)" : `translateY(${offsetY}px)`,
        filter: visible ? "blur(0)" : `blur(${blur}px)`,
        opacity: visible ? 1 : 0,
        transitionProperty: "transform, filter, opacity",
        transitionDuration: "900ms",
        transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        transitionDelay: `${delay}ms`,
        willChange: visible ? "auto" : "transform, filter, opacity",
        ...style,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Component>
  );
}
