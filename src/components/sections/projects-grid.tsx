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
  const [allProjectsOpen, setAllProjectsOpen] = useState(false);

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

      <FullWidthRow>
        <GridTile
          as="button"
          onClick={() => setAllProjectsOpen(true)}
          gridClassName="col-span-4 md:col-span-8 lg:col-span-12 border-b border-[var(--border)]"
        >
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--accent)]">
                All projects
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Open a full list of projects with highlights and stack details.
              </p>
            </div>
            <span className="text-sm font-medium text-[var(--text)]">
              View all
            </span>
          </div>
        </GridTile>
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

      {allProjectsOpen && (
        <ExpandableGridPopup
          isOpen={allProjectsOpen}
          onClose={() => setAllProjectsOpen(false)}
          layoutId="popup-all-projects"
          title="All projects"
        >
          <div className="space-y-8">
            {Object.values(projectDetails).map((project) => (
              <section key={project.id} className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-semibold text-[var(--text)]">
                    {project.title}
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-[var(--accent)]">
                    {project.category}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {project.description}
                </p>
                {project.highlights.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text)]">
                      Highlights
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-[var(--text-muted)] text-sm">
                      {project.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {project.stack.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text)]">
                      Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        </ExpandableGridPopup>
      )}
    </>
  );
}
