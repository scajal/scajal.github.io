import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md",
        "bg-[var(--border-subtle)] text-[var(--text-muted)]",
        "border border-[var(--border)]",
        className
      )}
    >
      {children}
    </span>
  );
}
