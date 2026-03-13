"use client";

import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "subtle" | "elevated";
}

export function GlassPanel({
  variant = "subtle",
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "border border-[var(--border)]",
        variant === "subtle" &&
          "bg-[var(--surface)]/80 backdrop-blur-sm shadow-[var(--shadow-subtle)]",
        variant === "elevated" &&
          "bg-[var(--surface-elevated)]/90 backdrop-blur-md shadow-[var(--shadow-elevated)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
