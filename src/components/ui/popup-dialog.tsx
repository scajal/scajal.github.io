"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { popupTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PopupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function PopupDialog({
  isOpen,
  onClose,
  title,
  children,
  className,
}: PopupDialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 bg-[var(--popup-backdrop)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={popupTransition}
            className={cn(
              "fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full z-50",
              "flex flex-col overflow-hidden",
              "bg-[var(--popup-surface)] border border-[var(--border)]",
              "shadow-[var(--shadow-elevated)]",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "dialog-title" : undefined}
          >
            <div className="flex items-center justify-between gap-4 p-6 md:p-8 border-b border-[var(--border)] shrink-0">
              {title && (
                <h2
                  id="dialog-title"
                  className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text)]"
                >
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 -m-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border-subtle)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 shrink-0 ml-auto"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
