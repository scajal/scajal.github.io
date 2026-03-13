"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectTile } from "@/components/ui/project-tile";
import { ExpandableGridPopup } from "@/components/ui/expandable-grid-popup";
import { FullWidthRow } from "@/components/layout/full-width-row";
import {
  projectsSectionData,
  projectDetails,
} from "@/data/portfolio";
import { Badge } from "@/components/ui/badge";
import { GridTile } from "@/components/ui/grid-tile";

export function ProjectsGrid() {
  const [activeProject, setActiveProject] = useState<string | null>(null);

  return (
    <>
      <FullWidthRow>
        <GridTile
          gridClassName="col-span-4 md:col-span-8 lg:col-span-12 border-b border-r border-[var(--border)]"
        >
          <SectionHeading
            eyebrow={projectsSectionData.eyebrow}
            title={projectsSectionData.title}
            intro={projectsSectionData.intro}
          />
        </GridTile>
      </FullWidthRow>

      <FullWidthRow>
        {projectsSectionData.summaries.map((project) => (
          <ProjectTile
            key={project.id}
            project={project}
            isExpanded={activeProject === project.id}
            onClick={() => setActiveProject(project.id)}
          />
        ))}
      </FullWidthRow>

      {activeProject && projectDetails[activeProject] && (
        <ExpandableGridPopup
          isOpen={!!activeProject}
          onClose={() => setActiveProject(null)}
          layoutId={`popup-project-${activeProject}`}
          title={projectDetails[activeProject].title}
        >
          <div className="space-y-6">
            <p className="text-sm font-medium text-[var(--accent)]">
              {projectDetails[activeProject].category}
            </p>
            <p className="text-base text-[var(--text)] leading-relaxed">
              {projectDetails[activeProject].description}
            </p>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2">
                Highlights
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[var(--text-muted)]">
                {projectDetails[activeProject].highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2">
                Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {projectDetails[activeProject].stack.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        </ExpandableGridPopup>
      )}
    </>
  );
}
