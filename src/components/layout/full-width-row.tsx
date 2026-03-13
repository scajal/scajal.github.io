"use client";

import { cn } from "@/lib/utils";

interface FullWidthRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * One full-width grid row: [left margin | center content | right margin].
 * Left/right have border-b (horizontal line) and border-r/border-l (vertical lines).
 * Center has the same 12-col grid as SiteGrid so content aligns.
 */
export function FullWidthRow({ children, className }: FullWidthRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-[1fr_minmax(0,64rem)_1fr] w-full min-w-0 max-w-full",
        className
      )}
      style={{ gridColumn: "1 / -1" }}
    >
      <div
        className="hidden md:block border-b border-r border-[var(--border)] border-dashed bg-[var(--background)] min-h-[1px]"
        aria-hidden
      />
      <div
        className={cn(
          "min-w-0 max-w-full grid gap-0",
          "grid-cols-4 md:grid-cols-8 lg:grid-cols-12"
        )}
      >
        {children}
      </div>
      <div
        className="hidden md:block border-b border-[var(--border)] border-dashed bg-[var(--background)] min-h-[1px]"
        aria-hidden
      />
    </div>
  );
}
