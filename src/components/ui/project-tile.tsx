"use client";

import { motion } from "framer-motion";
import { GridTile } from "@/components/ui/grid-tile";
import { Badge } from "@/components/ui/badge";
import { popupTransition } from "@/lib/motion";
import type { ProjectSummary } from "@/types/portfolio";

interface ProjectTileProps {
  project: ProjectSummary;
  isExpanded: boolean;
  onClick: () => void;
}

export function ProjectTile({ project, isExpanded, onClick }: ProjectTileProps) {
  return (
    <GridTile
      gridClassName="col-span-4 md:col-span-4 lg:col-span-6 row-span-2"
      as="button"
      onClick={onClick}
    >
      {!isExpanded ? (
        <motion.div
          layoutId={`popup-project-${project.id}`}
          transition={popupTransition}
          className="flex h-full min-w-0 flex-col justify-between text-left"
        >
          <div className="min-h-0 min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--accent)] mb-1">
              {project.category}
            </p>
            <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
              {project.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed break-words">
              {project.shortSummary}
            </p>
          </div>
          <div className="mt-4 flex shrink-0 flex-col gap-3 min-w-0">
            <div className="flex min-w-0 flex-wrap gap-2">
              {project.stackTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <p className="text-sm font-medium text-[var(--accent)]">
              {project.actionLabel} →
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex h-full flex-col justify-between text-left opacity-60">
          <div>
            <h3 className="text-xl font-semibold text-[var(--text)]">
              {project.title}
            </h3>
          </div>
        </div>
      )}
    </GridTile>
  );
}
