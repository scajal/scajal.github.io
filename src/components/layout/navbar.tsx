"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "#", label: "Home" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Grid row: solo estructura y bordes; el centro es un espaciador */}
      <header
        className="grid w-full min-w-0 grid-cols-1 md:grid-cols-[1fr_minmax(0,64rem)_1fr]"
        style={{ gridColumn: "1 / -1" }}
      >
        <div
          className="hidden md:block border-b border-r border-[var(--border)] border-dashed bg-[var(--background)] min-h-[1px]"
          aria-hidden
        />
        <div
          className="h-12 min-w-0 border-b border-r border-[var(--border)] border-dashed md:h-14"
          aria-hidden
        />
        <div
          className="hidden md:block border-b border-[var(--border)] border-dashed bg-[var(--background)] min-h-[1px]"
          aria-hidden
        />
      </header>

      {/* Barra centrada fija (misma altura que la fila de grilla para alinear borde inferior) */}
      <div
        className="fixed top-0 left-0 md:left-1/2 z-30 flex flex-col w-full max-w-[64rem] md:-translate-x-1/2 md:flex-row md:items-center border-b border-r border-[var(--border)] border-dashed bg-[var(--background)]/70 backdrop-blur-md px-4 md:h-14 md:px-6 lg:px-8 min-h-12 md:min-h-0 overflow-x-hidden overflow-y-auto scrollbar-hide max-h-screen md:max-h-none"
        role="banner"
      >
        <nav className="flex h-12 md:h-14 w-full items-center justify-between shrink-0">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            Santi
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="#contact"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-[var(--accent)] btn-on-accent hover:bg-[var(--accent-hover)] rounded-md transition-colors"
            >
              Let&apos;s Talk
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text)]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="md:hidden pt-4 pb-2 border-t border-[var(--border)] mt-2 overflow-y-auto scrollbar-hide max-h-[calc(100dvh-3rem)]"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border-subtle)] rounded-md"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium bg-[var(--accent)] btn-on-accent rounded-md mt-2"
              >
                Let&apos;s Talk
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
