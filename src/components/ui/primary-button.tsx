"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function PrimaryButton({
  href,
  children,
  variant = "primary",
  className,
}: PrimaryButtonProps) {
  const baseClass =
    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none";

  const variantClass =
    variant === "primary"
      ? "bg-[var(--accent)] btn-on-accent hover:bg-[var(--accent-hover)]"
      : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-elevated)]";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className={cn(baseClass, variantClass, className)}>
        {children}
      </Link>
    </motion.div>
  );
}
