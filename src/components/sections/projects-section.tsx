import { portfolioContent } from "@/src/data/portfolio";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { SectionShell } from "@/src/components/layout/section-shell";
import { ProjectCard } from "@/src/components/ui/project-card";

export function ProjectsSection() {
  const { projectsSection } = portfolioContent;

  return (
    <SectionShell id="projects">
      <SectionHeading
        eyebrow={projectsSection.eyebrow}
        title={projectsSection.title}
        intro={projectsSection.intro}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {projectsSection.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionShell>
  );
}

