"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  exiting?: boolean;
  className?: string;
}

export function LoadingScreen({ exiting, className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)]",
        "transition-opacity duration-700 ease-in-out",
        exiting && "opacity-0 pointer-events-none",
        className
      )}
      aria-hidden={exiting}
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-5"
      >
        {/* Monogram */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)]">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text)]">
            SC
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-px w-16 overflow-hidden bg-[var(--border)]">
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="h-full w-full bg-[var(--accent)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
