import Link from "next/link";
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
    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none active:scale-[0.99]";

  const variantClass =
    variant === "primary"
      ? "bg-[var(--accent)] btn-on-accent hover:bg-[var(--accent-hover)]"
      : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border-subtle)]";

  return (
    <Link
      href={href}
      className={cn(baseClass, variantClass, className)}
    >
      {children}
    </Link>
  );
}
