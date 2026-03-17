"use client";

import { motion } from "framer-motion";
import { credibilityItems } from "@/data/portfolio";
import { FullWidthRow } from "@/components/layout/full-width-row";
import { GridTile } from "@/components/ui/grid-tile";
import { staggerContainer, staggerItem, contentRevealViewport } from "@/lib/motion";

export function CredibilityGrid() {
  return (
    <FullWidthRow>
      {credibilityItems.map((item, i) => (
        <GridTile
          key={item.id}
          gridClassName="col-span-2 md:col-span-4 lg:col-span-3"
        >
          <motion.p
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={contentRevealViewport}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
            className="text-sm font-medium text-[var(--text)]"
          >
            {item.label}
          </motion.p>
        </GridTile>
      ))}
    </FullWidthRow>
  );
}
