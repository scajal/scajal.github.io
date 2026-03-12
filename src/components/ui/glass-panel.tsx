import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type GlassVariant = "subtle" | "default" | "elevated";

interface GlassPanelProps {
  variant?: GlassVariant;
  className?: string;
  children: ReactNode;
}

const baseClasses =
  "rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface)]/70 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.18)]";

const variantClasses: Record<GlassVariant, string> = {
  subtle:
    "border-[color:var(--border-subtle)] bg-[color:var(--surface)]/60 shadow-[0_14px_35px_rgba(15,23,42,0.12)]",
  default: "",
  elevated:
    "border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]/80 shadow-[0_22px_60px_rgba(15,23,42,0.28)]",
};

export function GlassPanel({ variant = "default", className, children }: GlassPanelProps) {
  return (
    <div className={cn(baseClasses, variantClasses[variant], "relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

