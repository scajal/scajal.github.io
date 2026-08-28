import type { Content } from "./types";
import { PROFILE } from "@/lib/site";

export const en: Content = {
  meta: {
    title: "Santiago Cajal — Tech Lead & Full-Stack Engineer",
    description:
      "Tech Lead and full-stack engineer in Montevideo. Ten years building fintech and crypto platforms with Laravel, React and TypeScript.",
  },
  nav: {
    skipToContent: "Skip to content",
    themeToggle: "Toggle theme",
  },
  hero: {
    headline: [
      "I build the platforms",
      "that money and data",
      "move through",
    ],
    headlineAccent: ".",
    subhead:
      "Tech Lead and full-stack engineer in Montevideo. Ten years across fintech, crypto and telemetry — mostly on systems that are not allowed to fall over.",
    currentlyLabel: "Currently",
    currently: [
      { org: "Criptala", role: "Development Lead" },
      { org: "rabbit | iot", role: "Co-Founder & CTO" },
    ],
  },
  work: {
    eyebrow: "Work",
    title: "Three systems worth explaining",
    intro:
      "Each of these solved a problem that could not be bought off the shelf.",
    items: [
      {
        slug: "criptala",
        name: "Criptala",
        years: "2021 — present",
        summary:
          "A crypto trading and payments platform taken from an empty repository to production, with fiat and crypto gateways behind a single API. I own the architecture, the schema and the roadmap.",
        tags: ["Laravel", "React", "Inertia", "REST API", "Docker"],
        result: { count: 6000, display: "6,000+", label: "active users" },
      },
      {
        slug: "rabbit-iot",
        name: "rabbit | iot",
        years: "2025 — present",
        summary:
          "LoRaWAN telemetry ingestion, payload decoding and alerting for farms and industrial sites. Multi-tenant from the first commit, with real-time dashboards on top.",
        tags: ["LoRaWAN", "Laravel", "React", "Multi-tenant", "Telemetry"],
        result: { display: "Co-founded", label: "and built the platform" },
      },
      {
        slug: "hexa-rfid",
        name: "RFID inventory system",
        years: "2016 — 2020",
        summary:
          "An annual inventory count that occupied five people for twenty hours each. Rebuilt around RFID tags and a reconciliation pass, it now takes one person an afternoon.",
        tags: ["RFID", "GeneXus", "Laravel", "Operations"],
        result: { display: "100 → 3", label: "person-hours per count" },
      },
    ],
  },
  ai: {
    eyebrow: "How I work",
    title: "AI belongs inside the process, not beside it",
    body: [
      "Most teams bolt AI onto the end of their workflow: a chat window in another tab, used for whatever felt tedious that afternoon. I have spent the last two years pushing it the other way — into specification, implementation and review, where the constraints actually live and where a wrong answer is still cheap to catch.",
      "What changes is the shape of the work rather than its volume. Writing code stops being the bottleneck, and the bottleneck becomes deciding what is worth building and judging whether what came back is correct. Neither of those is automatable, and both are the parts I would want to be doing anyway. The acceleration comes from collapsing the distance between them.",
      "The practical lesson has been that context beats tooling. Clear specifications, typed interfaces and documented decisions matter far more than which model is answering, because a codebase legible to a new engineer is legible to a model for the same reasons. Most of the work is making the system explain itself — which is worth doing whether or not anything is reading it.",
    ],
    stack: [
      { label: "In the loop", items: "Claude Code, MCP, Cursor, Codex" },
      {
        label: "Applied to",
        items: "Specification, implementation, code review",
      },
      {
        label: "Beyond the editor",
        items: "n8n, Slack integrations, internal workflows",
      },
    ],
  },
  past: {
    eyebrow: "Before",
    title: "The rest of it",
    roles: [
      {
        org: "BlueBoot",
        role: "Software Developer",
        period: "2020 — 2024",
        detail: "Enterprise business software on SAP BTP, with JavaScript on the front.",
      },
      {
        org: "Dvelop Software",
        role: "Software Developer",
        period: "2020",
        detail:
          "Backend and frontend for Midinero, including the prepaid card recharge system and the Empresas platform.",
      },
      {
        org: "heXa Sistemas",
        role: "Software Developer",
        period: "2016 — 2020",
        detail:
          "Internal systems for fintech and healthcare clients in GeneXus and Laravel. Home of the RFID rebuild.",
      },
    ],
    education:
      "BSc in Computer Science, Universidad de la Empresa, Montevideo (2017 — 2022).",
  },
  contact: {
    eyebrow: "Contact",
    title: "Get in touch",
    body:
      "Montevideo, UTC−3, working remotely. Email is the fastest way to reach me — and if you want my CV, just ask.",
    emailLabel: "Email",
    links: [
      { label: "Email", href: `mailto:${PROFILE.email}`, note: PROFILE.email },
      { label: "LinkedIn", href: PROFILE.linkedin, note: "in/scajal" },
      { label: "GitHub", href: PROFILE.github, note: "@scajal" },
    ],
  },
  footer: {
    built: "Built with Next.js. Typeset in Switzer and Geist Mono.",
  },
};
