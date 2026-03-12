import type { SkillGroup as SkillGroupType } from "@/src/types/portfolio";
import { GlassPanel } from "@/src/components/ui/glass-panel";

interface SkillGroupProps {
  group: SkillGroupType;
}

export function SkillGroup({ group }: SkillGroupProps) {
  return (
    <GlassPanel variant="subtle" className="flex flex-col gap-3 p-5 md:p-6">
      <h3 className="text-sm font-semibold tracking-tight text-[color:var(--text-strong)]">
        {group.label}
      </h3>
      <ul className="flex flex-wrap gap-1.5 text-sm text-[color:var(--text-muted-strong)]">
        {group.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-full bg-[color:var(--surface)]/80 px-3 py-1 text-xs"
          >
            {skill}
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}

