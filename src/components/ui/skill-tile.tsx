"use client";

import { motion } from "framer-motion";
import { GridTile } from "@/components/ui/grid-tile";
import { staggerContainer, staggerItem, contentRevealViewport } from "@/lib/motion";
import type { SkillGroup } from "@/types/portfolio";

interface SkillTileProps {
  group: SkillGroup;
}

export function SkillTile({ group }: SkillTileProps) {
  return (
    <GridTile gridClassName="col-span-4 md:col-span-4 lg:col-span-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={contentRevealViewport}
        className="space-y-3"
      >
        <motion.h4
          variants={staggerItem}
          className="text-sm font-semibold text-[var(--text)]"
        >
          {group.name}
        </motion.h4>
        <ul className="space-y-1">
          {group.items.map((item) => (
            <motion.li
              key={item}
              variants={staggerItem}
              className="text-sm text-[var(--text-muted)]"
            >
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </GridTile>
  );
}
