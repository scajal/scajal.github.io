"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillTile } from "@/components/ui/skill-tile";
import { ExpandableGridPopup } from "@/components/ui/expandable-grid-popup";
import { FullWidthRow } from "@/components/layout/full-width-row";
import { skillSummaryData, skillDetailData } from "@/data/portfolio";
import { GridTile } from "@/components/ui/grid-tile";
import { popupTransition } from "@/lib/motion";

export function SkillsGrid() {
  const [skillsOpen, setSkillsOpen] = useState(false);

  return (
    <>
      <FullWidthRow>
        <GridTile
          gridClassName="col-span-4 md:col-span-8 lg:col-span-12 border-b border-r border-[var(--border)]"
        >
          <SectionHeading
            eyebrow={skillSummaryData.eyebrow}
            title={skillSummaryData.title}
            intro={skillSummaryData.intro}
          />
        </GridTile>
      </FullWidthRow>

      <FullWidthRow>
        {skillSummaryData.groups.map((group) => (
          <SkillTile key={group.name} group={group} />
        ))}

        <GridTile
          gridClassName="col-span-4 md:col-span-4 lg:col-span-12"
          as="button"
          onClick={() => setSkillsOpen(true)}
        >
        {!skillsOpen ? (
          <motion.div
            layoutId="popup-skills"
            transition={popupTransition}
            className="h-full flex flex-col justify-center -m-6 md:-m-8 p-6 md:p-8"
          >
            <p className="text-sm font-medium text-[var(--accent)]">
              {skillSummaryData.actionLabel} →
            </p>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col justify-center -m-6 md:-m-8 p-6 md:p-8 opacity-60">
            <p className="text-sm font-medium text-[var(--accent)]">
              {skillSummaryData.actionLabel}
            </p>
          </div>
        )}
        </GridTile>
      </FullWidthRow>

      <ExpandableGridPopup
        isOpen={skillsOpen}
        onClose={() => setSkillsOpen(false)}
        layoutId="popup-skills"
        title="Full Expertise"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {skillDetailData.groups.map((group) => (
            <div key={group.name} className="space-y-4">
              <h4 className="text-sm font-semibold text-[var(--text)]">
                {group.name}
              </h4>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-[var(--text-muted)]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ExpandableGridPopup>
    </>
  );
}
