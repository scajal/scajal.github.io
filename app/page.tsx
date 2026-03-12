import { HeroSection } from "@/src/components/sections/hero-section";
import { CredibilityStrip } from "@/src/components/sections/credibility-strip";
import { ProjectsSection } from "@/src/components/sections/projects-section";
import { SkillsSection } from "@/src/components/sections/skills-section";
import { ContactSection } from "@/src/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CredibilityStrip />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </>
  );
}
