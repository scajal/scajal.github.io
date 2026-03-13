"use client";

import { cn } from "@/lib/utils";

interface SiteGridProps {
  children: React.ReactNode;
  className?: string;
}

export function SiteGrid({ children, className }: SiteGridProps) {
  return (
    <div
      className={cn(
        "grid w-full",
        "grid-cols-4 md:grid-cols-8 lg:grid-cols-12",
        "gap-0",
        "min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
}
