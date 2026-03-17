"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, contentRevealViewport } from "@/lib/motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className = "",
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={contentRevealViewport}
      className={className}
    >
      {eyebrow && (
        <motion.p
          variants={staggerItem}
          className="text-sm font-medium tracking-wider uppercase text-[var(--accent)] mb-2"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        variants={staggerItem}
        className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)] mb-3"
      >
        {title}
      </motion.h2>
      {intro && (
        <motion.p
          variants={staggerItem}
          className="text-base text-[var(--text-muted)] leading-relaxed max-w-[65ch]"
        >
          {intro}
        </motion.p>
      )}
    </motion.div>
  );
}
