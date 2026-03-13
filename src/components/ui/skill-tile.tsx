"use client";

import { GridTile } from "@/components/ui/grid-tile";
import type { SkillGroup } from "@/types/portfolio";

interface SkillTileProps {
  group: SkillGroup;
}

export function SkillTile({ group }: SkillTileProps) {
  return (
    <GridTile gridClassName="col-span-4 md:col-span-4 lg:col-span-4">
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[var(--text)]">
          {group.name}
        </h4>
        <ul className="space-y-1">
          {group.items.map((item) => (
            <li key={item} className="text-sm text-[var(--text-muted)]">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </GridTile>
  );
}
