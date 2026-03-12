"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface PrimaryButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  children: ReactNode;
  variant?: "solid" | "ghost";
}

export function PrimaryButton({
  children,
  className,
  variant = "solid",
  ...rest
}: PrimaryButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]";

  const styles =
    variant === "solid"
      ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_16px_30px_rgba(15,23,42,0.35)] hover:bg-[color:var(--accent-soft)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.45)] active:shadow-[0_10px_26px_rgba(15,23,42,0.45)] active:translate-y-[1px]"
      : "border border-[color:var(--border-soft)] bg-[color:var(--surface)]/60 text-[color:var(--text-primary)] hover:bg-[color:var(--surface)]/90 active:translate-y-[1px]";

  return (
    <button type="button" className={cn(base, styles, className)} {...rest}>
      {children}
    </button>
  );
}


