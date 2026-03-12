import type { Project } from "@/src/types/portfolio";
import { GlassPanel } from "@/src/components/ui/glass-panel";
import { Badge } from "@/src/components/ui/badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <GlassPanel
      variant="subtle"
      className="group flex flex-col justify-between gap-6 p-6 transition-transform duration-200 ease-out hover:-translate-y-1 md:p-7"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-[color:var(--text-strong)]">
              {project.title}
            </h3>
            <p className="text-xs md:text-sm text-[color:var(--text-muted-strong)]">
              {project.category}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-[color:var(--text-muted)]">
          {project.description}
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-[color:var(--text-muted-strong)]">
          {project.highlights.map((h) => (
            <li key={h.text} className="flex gap-2">
              <span className="mt-[6px] h-[3px] w-[12px] rounded-full bg-[color:var(--accent-soft)]" />
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <Badge key={item} className="bg-[color:var(--surface)]/80">
            {item}
          </Badge>
        ))}
      </div>
    </GlassPanel>
  );
}

