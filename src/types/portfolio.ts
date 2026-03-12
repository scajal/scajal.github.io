export type SocialLinkType = "github" | "linkedin" | "email";

export interface SocialLink {
  type: SocialLinkType;
  label: string;
  href: string;
}

export interface HeroSummaryItem {
  label: string;
  value: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  subheadline: string;
  body: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  socialLinks: SocialLink[];
  summaryItems: HeroSummaryItem[];
}

export interface CredibilityItem {
  label: string;
}

export interface ProjectHighlight {
  text: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  highlights: ProjectHighlight[];
  stack: string[];
}

export interface ProjectsSection {
  eyebrow: string;
  title: string;
  intro: string;
  projects: Project[];
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
}

export interface SkillsSection {
  eyebrow: string;
  title: string;
  intro: string;
  groups: SkillGroup[];
}

export interface ContactSection {
  eyebrow: string;
  title: string;
  body: string;
  closingLine: string;
  socialLinks: SocialLink[];
}

export interface FooterContent {
  mainLine: string;
  secondaryLine?: string;
}

export interface PortfolioContent {
  hero: HeroContent;
  credibility: CredibilityItem[];
  projectsSection: ProjectsSection;
  skillsSection: SkillsSection;
  contactSection: ContactSection;
  footer: FooterContent;
}

