"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/src/components/ui/theme-toggle";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "#home", label: "Home" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 md:px-6 md:pt-6">
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto flex w-full items-center justify-between gap-4 rounded-2xl border border-transparent bg-transparent px-3 py-2 text-sm transition-all duration-300",
          "md:px-4 md:py-3",
          scrolled
            ? "max-w-4xl border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 shadow-[0_18px_40px_rgba(15,23,42,0.38)] backdrop-blur-xl"
            : "max-w-6xl bg-gradient-to-b from-[color:var(--background)]/95 to-[color:var(--background)]/60",
        )}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-7 w-7 rounded-full bg-[color:var(--accent)]/15 ring-1 ring-[color:var(--accent-soft)]" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
              Santiago Cajal
            </span>
            <span className="text-xs text-[color:var(--text-muted-strong)]">
              Software Development Lead
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <ul className="hidden items-center gap-4 text-xs font-medium text-[color:var(--text-muted-strong)] md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-2.5 py-1 transition-colors hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <div className="hidden md:block">
            <PrimaryButton
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Let&apos;s Talk
            </PrimaryButton>
          </div>
        </div>
      </nav>
    </header>
  );
}

