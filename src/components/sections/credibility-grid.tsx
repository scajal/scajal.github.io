"use client";

import { credibilityItems } from "@/data/portfolio";
import { FullWidthRow } from "@/components/layout/full-width-row";
import { GridTile } from "@/components/ui/grid-tile";

export function CredibilityGrid() {
  return (
    <FullWidthRow>
      {credibilityItems.map((item) => (
        <GridTile
          key={item.id}
          gridClassName="col-span-2 md:col-span-4 lg:col-span-3"
        >
          <p className="text-sm font-medium text-[var(--text)]">
            {item.label}
          </p>
        </GridTile>
      ))}
    </FullWidthRow>
  );
}
