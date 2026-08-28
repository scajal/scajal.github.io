export type WorkCard = {
  slug: string;
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
  work: { eyebrow: string; title: string; intro: string; items: WorkCard[] };
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
};

export const CASE_SLUGS = ["criptala", "rabbit-iot", "hexa-rfid"] as const;
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
  /** Rendered as an empty framed slot until real imagery exists. */
  media?: { caption: string }[];
  meta: { title: string; description: string };
};

export type CaseContent = {
  backToWork: string;
  nextLabel: string;
  studies: Record<CaseSlug, CaseStudy>;
};
