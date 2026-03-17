"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroGrid } from "@/components/sections/hero-grid";
import { CredibilityGrid } from "@/components/sections/credibility-grid";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { SkillsGrid } from "@/components/sections/skills-grid";
import { ContactGrid } from "@/components/sections/contact-grid";
import { RobotPet } from "@/components/ui/robot-pet";

export default function Home() {
  return (
    <>
      <RobotPet />
      <main className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,64rem)_1fr] auto-rows-auto w-full min-w-0 min-h-screen bg-[var(--background)] overflow-x-hidden">
        <Navbar />
        <div style={{ gridColumn: "1 / -1" }}>
          <HeroGrid />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <CredibilityGrid />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <ProjectsGrid />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <SkillsGrid />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <ContactGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
