import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/70 px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

