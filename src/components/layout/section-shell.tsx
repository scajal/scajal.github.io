import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface SectionShellProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export function SectionShell({ id, children, className }: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 px-4 py-12 md:px-6 md:py-16 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-12">
        {children}
      </div>
    </section>
  );
}

