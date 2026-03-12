import type { PortfolioContent, SocialLinkType } from "@/src/types/portfolio";

const socialHrefMap: Record<SocialLinkType, string> = {
  github: "https://github.com/scajal",
  linkedin: "https://www.linkedin.com/in/santiago-cajal/",
  email: "mailto:hello@santiagocajal.dev",
};

export const portfolioContent: PortfolioContent = {
  hero: {
    eyebrow: "8+ years in fintech, crypto, and IoT",
    headline: "Software Development Lead | Full-Stack Engineer | Scalable Fintech Products",
    subheadline:
      "Development Lead and Full-Stack Engineer with 8+ years of experience designing, building, and scaling secure web platforms across fintech and IoT.",
    body: "Currently leading the development of a cryptocurrency trading and payments platform, owning technical architecture, backend and frontend development, and key technical decisions. I work closely with product and business stakeholders to turn ideas into secure, scalable, and maintainable solutions.",
    primaryCtaLabel: "View Projects",
    secondaryCtaLabel: "Contact Me",
    socialLinks: [
      {
        type: "github",
        label: "GitHub",
        href: socialHrefMap.github,
      },
      {
        type: "linkedin",
        label: "LinkedIn",
        href: socialHrefMap.linkedin,
      },
      {
        type: "email",
        label: "Email",
        href: socialHrefMap.email,
      },
    ],
    summaryItems: [
      { label: "Role", value: "Software Development Lead" },
      { label: "Experience", value: "8+ Years" },
      { label: "Focus", value: "Full-Stack Architecture" },
      { label: "Industries", value: "Fintech, Crypto, IoT" },
      { label: "Core Stack", value: "Laravel, React, TypeScript" },
      { label: "Approach", value: "Product-minded engineering" },
    ],
  },
  credibility: [
    { label: "8+ Years of Experience" },
    { label: "Fintech & Crypto Platforms" },
    { label: "IoT Product Development" },
    { label: "Full-Stack Technical Leadership" },
  ],
  projectsSection: {
    eyebrow: "Selected Work",
    title: "Projects that reflect how I build",
    intro:
      "A selection of platforms where I’ve contributed through technical leadership, product execution, and full-stack development, with a strong focus on scalability, maintainability, and real business impact.",
    projects: [
      {
        id: "criptala",
        title: "Criptala",
        category: "Cryptocurrency trading and payments platform",
        description:
          "I lead the development of a crypto trading and payments platform, owning technical architecture, backend and frontend implementation, and key technical decisions across the product.",
        highlights: [
          { text: "Led technical architecture and platform evolution" },
          { text: "Built and maintained backend and frontend solutions" },
          { text: "Collaborated closely with product and business stakeholders" },
          { text: "Focused on secure, scalable, and maintainable product decisions" },
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
      {
        id: "rabbit-agro",
        title: "Rabbit Agro",
        category: "IoT platform for agricultural monitoring",
        description:
          "I lead Rabbit Agro, an IoT platform based on LoRaWAN focused on agricultural monitoring and rural use cases, combining software development with practical operational needs in the field.",
        highlights: [
          { text: "Built around LoRaWAN-based monitoring use cases" },
          { text: "Focused on rural connectivity and agricultural environments" },
          { text: "Combined product thinking with platform development" },
          { text: "Designed for reliability, clarity, and long-term usability" },
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
    ],
  },
  skillsSection: {
    eyebrow: "Core Expertise",
    title: "Technology, architecture, and execution",
    intro:
      "My work combines strong backend foundations, modern frontend engineering, and the ability to lead technical decisions in product-driven environments.",
    groups: [
      {
        id: "backend",
        label: "Backend",
        skills: [
          "PHP",
          "Laravel",
          "API Design",
          "Payment Gateway Integrations",
          "Scalable Web Architectures",
        ],
      },
      {
        id: "frontend",
        label: "Frontend",
        skills: ["JavaScript", "TypeScript", "React", "Vue", "Next.js"],
      },
      {
        id: "leadership-architecture",
        label: "Leadership & Architecture",
        skills: [
          "Technical Architecture",
          "Full-Stack Product Development",
          "Product Collaboration",
          "Mentoring Engineers",
          "Development Process Improvement",
        ],
      },
    ],
  },
  contactSection: {
    eyebrow: "Contact",
    title: "Let’s build something solid",
    body: "I’m open to conversations about senior engineering, technical leadership, and product-focused development roles, especially in fintech, platforms, and technically ambitious products.",
    closingLine: "Open to meaningful product and engineering conversations.",
    socialLinks: [
      {
        type: "email",
        label: "Email",
        href: socialHrefMap.email,
      },
      {
        type: "linkedin",
        label: "LinkedIn",
        href: socialHrefMap.linkedin,
      },
      {
        type: "github",
        label: "GitHub",
        href: socialHrefMap.github,
      },
    ],
  },
  footer: {
    mainLine: "Santi — Software Development Lead & Full-Stack Engineer",
    secondaryLine: "Building secure, scalable, and thoughtful digital products.",
  },
};

