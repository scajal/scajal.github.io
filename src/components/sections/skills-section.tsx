import { portfolioContent } from "@/src/data/portfolio";
import { SectionShell } from "@/src/components/layout/section-shell";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { SkillGroup } from "@/src/components/ui/skill-group";

export function SkillsSection() {
  const { skillsSection } = portfolioContent;

  return (
    <SectionShell id="skills">
      <SectionHeading
        eyebrow={skillsSection.eyebrow}
        title={skillsSection.title}
        intro={skillsSection.intro}
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {skillsSection.groups.map((group) => (
          <SkillGroup key={group.id} group={group} />
        ))}
      </div>
    </SectionShell>
  );
}

