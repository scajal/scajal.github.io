"use client";

import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  /** Cuando true, la pantalla se oculta con transición */
  exiting?: boolean;
  className?: string;
}

export function LoadingScreen({ exiting, className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)] transition-opacity duration-500 ease-out",
        exiting && "opacity-0 pointer-events-none",
        className
      )}
      aria-hidden={exiting}
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-8">
        <p className="text-lg font-semibold tracking-tight text-[var(--text)]">
          Santi
        </p>
        <div
          className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin"
          aria-hidden
        />
      </div>
    </div>
  );
}
