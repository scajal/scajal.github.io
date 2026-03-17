"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ease } from "@/lib/motion";

const navLinks = [
  { href: "#", label: "Home" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Grid row spacer */}
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

      {/* Fixed navbar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: ease.outExpo }}
        className={[
          "fixed top-0 left-0 md:left-1/2 z-30 flex flex-col w-full max-w-[64rem]",
          "md:-translate-x-1/2 md:flex-row md:items-center",
          "border-b border-r border-[var(--border)] border-dashed",
          "px-4 md:h-14 md:px-6 lg:px-8 min-h-12 md:min-h-0",
          "overflow-x-hidden overflow-y-auto scrollbar-hide max-h-screen md:max-h-none",
          "transition-all duration-300",
          scrolled
            ? "bg-[var(--background)]/85 backdrop-blur-xl"
            : "bg-[var(--background)]/70 backdrop-blur-md",
        ].join(" ")}
        role="banner"
      >
        <nav className="flex h-12 md:h-14 w-full items-center justify-between shrink-0">
          <Link
            href="/"
            className="flex items-center justify-center h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--background)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200"
            aria-label="Home"
          >
            SC
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: ease.outExpo, delay: 0.08 + i * 0.05 }}
              >
                <Link
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200 rounded-md"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: ease.outExpo, delay: 0.3 }}
            >
              <Link
                href="#contact"
                className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-[var(--accent)] btn-on-accent hover:bg-[var(--accent-hover)] rounded-md transition-colors duration-200"
              >
                Let&apos;s Talk
              </Link>
            </motion.div>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: ease.out }}
              className="md:hidden pt-4 pb-2 border-t border-[var(--border)] mt-2 overflow-y-auto scrollbar-hide max-h-[calc(100dvh-3rem)]"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: ease.outExpo, delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] rounded-md transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
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
        </AnimatePresence>
      </motion.div>
    </>
  );
}
