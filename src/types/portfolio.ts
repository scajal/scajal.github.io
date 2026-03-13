export interface HeroData {
  eyebrow: string;
  headline: string;
  subheadline: string;
  supportingLine: string;
  ctaButtons: { label: string; href: string }[];
  socialLinks: { label: string; href: string; icon: string }[];
}

export interface ProfileSummaryData {
  role: string;
  experience: string;
  focus: string;
  industries: string;
  coreStack: string;
  approach: string;
  actionLabel: string;
}

export interface CredibilityItem {
  id: string;
  label: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  category: string;
  shortSummary: string;
  stackTags: string[];
  actionLabel: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  highlights: string[];
  stack: string[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface SkillSummaryData {
  eyebrow: string;
  title: string;
  intro: string;
  groups: SkillGroup[];
  actionLabel: string;
}

export interface SkillDetailData {
  groups: SkillGroup[];
}

export interface ContactData {
  eyebrow: string;
  title: string;
  paragraph: string;
  methods: { label: string; href: string; icon: string }[];
  closingLine: string;
}

export interface FooterData {
  mainLine: string;
  secondaryLine?: string;
}

export interface ProjectsSectionData {
  eyebrow: string;
  title: string;
  intro: string;
  summaries: ProjectSummary[];
}
