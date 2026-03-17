"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { popupTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ExpandableGridPopupProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ExpandableGridPopup({
  isOpen,
  onClose,
  layoutId,
  title,
  children,
  className,
}: ExpandableGridPopupProps) {
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
      window.dispatchEvent(new CustomEvent("popup:open"));
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  // Notify on close
  useEffect(() => {
    if (!isOpen) window.dispatchEvent(new CustomEvent("popup:close"));
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[var(--popup-backdrop)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="popup"
            layoutId={layoutId}
            initial={false}
            transition={popupTransition}
            className={cn(
              "fixed inset-4 md:inset-8 lg:inset-12 xl:inset-16 z-50",
              "flex flex-col overflow-hidden",
              "bg-[var(--popup-surface)] border border-[var(--border)]",
              "shadow-[var(--shadow-popup)]",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "popup-title" : undefined}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 p-6 md:p-8 border-b border-[var(--border)] shrink-0">
              {title && (
                <h2
                  id="popup-title"
                  className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text)]"
                >
                  {title}
                </h2>
              )}
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="p-2 -m-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-colors duration-200 focus:outline-none shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
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
