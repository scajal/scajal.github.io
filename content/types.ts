export type WorkCard = {
  slug: CaseSlug;
  name: string;
  years: string;
  summary: string;
  tags: string[];
  /** The one number this project is remembered by. */
  result: {
    /** Numeric target for the count-up. Omit when the value is not a single number. */
    count?: number;
    display: string;
    label: string;
  };
};

export type PastRole = {
  org: string;
  role: string;
  period: string;
  detail: string;
};

export type Content = {
  meta: { title: string; description: string };
  nav: { skipToContent: string; themeToggle: string };
  hero: {
    /** One entry per rendered line; each animates in on its own delay. */
    headline: string[];
    headlineAccent: string;
    subhead: string;
    currentlyLabel: string;
    currently: { org: string; role: string }[];
  };
  work: {
    eyebrow: string;
    title: string;
    intro: string;
    /** Prefix of the link to a project's own site: "Visit". */
    visitSite: string;
    items: WorkCard[];
  };
  ai: {
    eyebrow: string;
    title: string;
    body: string[];
    stack: { label: string; items: string }[];
  };
  past: { eyebrow: string; title: string; roles: PastRole[]; education: string };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    emailLabel: string;
    links: { label: string; href: string; note: string }[];
  };
  footer: { built: string };
  cases: CaseContent;
  blog: BlogContent;
};

export type BlogContent = {
  /** Label of the link in the site header, and the index page's h1. */
  title: string;
  /** Title tag of the index page. */
  metaTitle: string;
  /** Under the index page's title, and its meta description. */
  description: string;
  /** Home page section. */
  eyebrow: string;
  sectionTitle: string;
  allPosts: string;
  /** "{minutes} min read" */
  minutesRead: string;
  published: string;
  updated: string;
  scheduled: string;
  onThisPage: string;
  keepReading: string;
  backToBlog: string;
  rss: string;
  empty: { title: string; body: string };
};

export const CASE_SLUGS = [
  "contamos",
  "criptala",
  "rabbit-iot",
  "hexa-rfid",
] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

export type CaseStudy = {
  name: string;
  role: string;
  years: string;
  /** One sentence under the title. */
  lede: string;
  /** Sidebar facts: stack, team size, status. */
  facts: { label: string; value: string }[];
  /** Context / Constraint / Approach / Outcome. */
  sections: { heading: string; body: string[] }[];
  meta: { title: string; description: string };
};

export type CaseContent = {
  backToWork: string;
  nextLabel: string;
  studies: Record<CaseSlug, CaseStudy>;
};
