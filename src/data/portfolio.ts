import type {
  HeroData,
  ProfileSummaryData,
  CredibilityItem,
  ProjectSummary,
  ProjectDetail,
  ProjectsSectionData,
  SkillSummaryData,
  SkillDetailData,
  ContactData,
  FooterData,
} from "@/types/portfolio";

export const heroData: HeroData = {
  eyebrow: "8+ years in fintech, crypto, and IoT",
  headline:
    "Software Development Lead | Full-Stack Engineer | Scalable Fintech Products",
  subheadline:
    "Building secure, scalable platforms across fintech, crypto, and IoT.",
  supportingLine:
    "Currently leading the development of a cryptocurrency trading and payments platform with a focus on architecture, full-stack execution, and product-minded engineering.",
  ctaButtons: [
    { label: "View Projects", href: "#projects" },
    { label: "Contact Me", href: "#contact" },
  ],
  socialLinks: [
    { label: "GitHub", href: "https://github.com/scajal", icon: "github" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/santiagocajal",
      icon: "linkedin",
    },
    { label: "Email", href: "mailto:hello@santiagocajal.dev", icon: "mail" },
  ],
};

export const profileSummaryData: ProfileSummaryData = {
  role: "Software Development Lead",
  experience: "8+ Years",
  focus: "Full-Stack Architecture",
  industries: "Fintech, Crypto, IoT",
  coreStack: "Laravel, React, TypeScript",
  approach: "Product-minded engineering",
  actionLabel: "More about me",
};

export const credibilityItems: CredibilityItem[] = [
  { id: "exp", label: "8+ Years of Experience" },
  { id: "fintech", label: "Fintech & Crypto Platforms" },
  { id: "iot", label: "IoT Product Development" },
  { id: "leadership", label: "Full-Stack Technical Leadership" },
];

export const projectSummaries: ProjectSummary[] = [
  {
    id: "criptala",
    title: "Criptala",
    category: "Cryptocurrency trading and payments platform",
    shortSummary:
      "Leading architecture and full-stack development for a secure, scalable trading and payments product.",
    stackTags: ["Laravel", "React", "TypeScript"],
    actionLabel: "View details",
  },
  {
    id: "rabbit-agro",
    title: "Rabbit Agro",
    category: "IoT platform for agricultural monitoring",
    shortSummary:
      "Building an IoT platform based on LoRaWAN for agricultural monitoring and rural use cases.",
    stackTags: ["Laravel", "TypeScript", "IoT"],
    actionLabel: "View details",
  },
];

export const projectDetails: Record<string, ProjectDetail> = {
  criptala: {
    id: "criptala",
    title: "Criptala",
    category: "Cryptocurrency trading and payments platform",
    description:
      "I lead the development of a crypto trading and payments platform, owning technical architecture, backend and frontend implementation, and key technical decisions across the product.",
    highlights: [
      "Led technical architecture and platform evolution",
      "Built and maintained backend and frontend solutions",
      "Collaborated closely with product and business stakeholders",
      "Focused on secure, scalable, and maintainable product decisions",
    ],
    stack: [
      "Laravel",
      "PHP",
      "React",
      "Next.js",
      "TypeScript",
      "APIs",
      "Payment Integrations",
    ],
  },
  "rabbit-agro": {
    id: "rabbit-agro",
    title: "Rabbit Agro",
    category: "IoT platform for agricultural monitoring",
    description:
      "I lead Rabbit Agro, an IoT platform based on LoRaWAN focused on agricultural monitoring and rural use cases, combining software development with practical operational needs in the field.",
    highlights: [
      "Built around LoRaWAN-based monitoring use cases",
      "Focused on rural connectivity and agricultural environments",
      "Combined product thinking with platform development",
      "Designed for reliability, clarity, and long-term usability",
    ],
    stack: [
      "Laravel",
      "PHP",
      "JavaScript",
      "TypeScript",
      "IoT Integrations",
      "Platform Architecture",
    ],
  },
};

export const projectsSectionData: ProjectsSectionData = {
  eyebrow: "Selected Work",
  title: "Projects that reflect how I build",
  intro:
    "A selection of platforms where I've contributed through technical leadership, product execution, and full-stack development, with a strong focus on scalability, maintainability, and real business impact.",
  summaries: projectSummaries,
};

export const skillSummaryData: SkillSummaryData = {
  eyebrow: "Core Expertise",
  title: "Technology, architecture, and execution",
  intro:
    "My work combines strong backend foundations, modern frontend engineering, and the ability to lead technical decisions in product-driven environments.",
  groups: [
    {
      name: "Backend",
      items: ["PHP", "Laravel", "API Design"],
    },
    {
      name: "Frontend",
      items: ["TypeScript", "React", "Next.js"],
    },
    {
      name: "Leadership & Architecture",
      items: ["Technical Architecture", "Product Collaboration", "Mentoring"],
    },
  ],
  actionLabel: "See full expertise",
};

export const skillDetailData: SkillDetailData = {
  groups: [
    {
      name: "Backend",
      items: [
        "PHP",
        "Laravel",
        "API Design",
        "Payment Gateway Integrations",
        "Scalable Web Architectures",
      ],
    },
    {
      name: "Frontend",
      items: ["JavaScript", "TypeScript", "React", "Vue", "Next.js"],
    },
    {
      name: "Leadership & Architecture",
      items: [
        "Technical Architecture",
        "Full-Stack Product Development",
        "Product Collaboration",
        "Mentoring Engineers",
        "Development Process Improvement",
      ],
    },
  ],
};

export const contactData: ContactData = {
  eyebrow: "Contact",
  title: "Let's build something solid",
  paragraph:
    "I'm open to conversations about senior engineering, technical leadership, and product-focused development roles, especially in fintech, platforms, and technically ambitious products.",
  methods: [
    { label: "Email", href: "mailto:hello@santiagocajal.dev", icon: "mail" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/santiagocajal",
      icon: "linkedin",
    },
    { label: "GitHub", href: "https://github.com/scajal", icon: "github" },
  ],
  closingLine: "Open to meaningful product and engineering conversations.",
};

export const footerData: FooterData = {
  mainLine: "Santi — Software Development Lead & Full-Stack Engineer",
  secondaryLine: "Building secure, scalable, and thoughtful digital products.",
};

export const aboutPopupContent = {
  paragraphs: [
    "Development Lead and Full-Stack Engineer with 8+ years of experience designing, building, and scaling secure web platforms across fintech and IoT.",
    "After growing into a Development Lead role from a Senior Software Engineer position, I currently lead the development of a cryptocurrency trading and payments platform, owning technical architecture, backend and frontend development, and key technical decisions. I work closely with product and business stakeholders to translate ideas into secure, scalable, and maintainable solutions.",
    "My core expertise includes Laravel, modern JavaScript frameworks (React, Vue, Next.js), TypeScript, API design, payment gateway integrations, and cloud-based architectures. I also lead Rabbit Agro, an IoT platform based on LoRaWAN focused on agricultural monitoring and rural use cases.",
    "I enjoy mentoring engineers, improving development processes, and building products that deliver real business impact.",
  ],
};
