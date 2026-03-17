"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SiteGrid } from "@/components/layout/site-grid";
import { HeroGrid } from "@/components/sections/hero-grid";
import { CredibilityGrid } from "@/components/sections/credibility-grid";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { ContactGrid } from "@/components/sections/contact-grid";
import { RobotPet } from "@/components/ui/robot-pet";

export default function Home() {
  return (
    <>
      <Navbar />
      <RobotPet />
      <main className="pt-20 md:pt-24">
        <SiteGrid>
          <HeroGrid />
          <CredibilityGrid />
          <ProjectsGrid />
          <SkillsGrid />
          <ContactGrid />
        </SiteGrid>
      </main>
      <Footer />
    </>
  );
}
