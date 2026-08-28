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
        tags: ["RFID", "GeneXus", "Operations"],
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
    body: "Montevideo, UTC−3.",
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
  cases: {
    backToWork: "All work",
    nextLabel: "Next project",
    studies: {
      criptala: {
        name: "Criptala",
        role: "Development Lead",
        years: "2021 — present",
        lede: "A crypto trading and payments platform taken from an empty repository to production, and the team that now runs it.",
        facts: [
          { label: "Role", value: "Sr. Engineer → Development Lead" },
          { label: "Stack", value: "Laravel, MySQL, React, Inertia, Docker" },
          { label: "Team", value: "Two engineers and a QA, which I lead" },
          { label: "Status", value: "In production" },
        ],
        sections: [
          {
            heading: "Context",
            body: [
              "I joined Criptala in 2021 as a senior engineer, with a product that existed as a business plan and not much else. The goal was a platform where people could buy, sell and hold cryptocurrency, and settle in local currency — which means two entirely different financial worlds meeting inside one system.",
              "I built the first version, and over the following two years moved from writing most of the code to owning the architecture, the API design and the technical roadmap as Development Lead.",
            ],
          },
          {
            heading: "Constraint",
            body: [
              "Everything the platform touches is money, which removes the usual escape hatches. An order that half-executes is not a bug you patch next sprint. Fiat rails and crypto rails fail in different ways and on different timescales: a bank transfer can be reversed days later, a chain transaction cannot be reversed at all, and the system has to be correct across both.",
              "The second constraint was size. A small team cannot afford a design that needs a specialist per subsystem, so the architecture had to stay comprehensible to everyone working on it.",
            ],
          },
          {
            heading: "Approach",
            body: [
              "A Laravel backend owning the domain and the database schema, with a single REST API as the only way in. Payment gateways — fiat and crypto — sit behind an internal abstraction, so adding or replacing a provider is a contained change rather than an archaeology project.",
              "The frontend is React through Inertia, which lets the client stay a thin layer over server-owned state instead of a second application maintaining its own copy of the truth. Development and deployment run in Docker with CI/CD pipelines, so what runs on a laptop is what runs in production.",
              "As lead, a large part of the work is not code: running requirements elicitation with product and business stakeholders, and turning what they need into specifications a small team can actually schedule.",
            ],
          },
          {
            heading: "Outcome",
            body: [
              "The platform serves over 6,000 active users and processes roughly 1,500 completed orders a month. It has been in continuous production since launch, and the team has grown around it rather than around a rewrite.",
            ],
          },
        ],
        meta: {
          title: "Criptala — crypto trading and payments platform",
          description:
            "Building a crypto trading and payments platform from an empty repository to over 6,000 active users, as engineer and then Development Lead.",
        },
      },
      "rabbit-iot": {
        name: "rabbit | iot",
        role: "Co-Founder & CTO",
        years: "2025 — present",
        lede: "A LoRaWAN telemetry platform for farms and industrial sites, built multi-tenant from the first commit.",
        facts: [
          { label: "Role", value: "Co-Founder & CTO" },
          { label: "Stack", value: "Laravel, React, LoRaWAN" },
          { label: "Architecture", value: "Multi-tenant" },
          { label: "Status", value: "Early, in active development" },
        ],
        sections: [
          {
            heading: "Context",
            body: [
              "rabbit | iot is a company I co-founded to put telemetry somewhere it usually is not: rural and agricultural sites, where there is no reliable power, no reliable network, and no appetite for equipment that needs attention.",
              "LoRaWAN is the answer to those constraints. It trades bandwidth for range and battery life, which is exactly the trade you want when a sensor has to sit in a field and report for years.",
            ],
          },
          {
            heading: "Constraint",
            body: [
              "Low-power devices are intermittent by design. They sleep, they miss transmissions, and they arrive out of order — so the platform cannot treat a gap in the data as a failure, and cannot treat the arrival order as the event order.",
              "Payloads are binary and vendor-specific: every sensor model encodes its readings differently, and the decoding has to live somewhere that does not require a deploy each time a new model appears.",
              "And because the product serves multiple clients with multiple sites, tenancy could not be retrofitted. It had to be a property of the data model from the beginning.",
            ],
          },
          {
            heading: "Approach",
            body: [
              "A Laravel backend handles ingestion, decoding and persistence. Payloads are decoded per sensor type into a normalised reading — a value, a unit, a device, a timestamp — so that everything downstream works against one shape regardless of which vendor produced it.",
              "On top of that sit alerts and metrics, and a React frontend for real-time dashboards. Multi-tenancy runs through the data model rather than being enforced at the edges, so a query cannot accidentally cross a tenant boundary.",
            ],
          },
          {
            heading: "Outcome",
            body: [
              "The platform is running and in active development. This page will get more specific — including real dashboards — as the product matures.",
            ],
          },
        ],
        meta: {
          title: "rabbit | iot — LoRaWAN telemetry platform",
          description:
            "Co-founding and building a multi-tenant LoRaWAN telemetry platform for rural, agricultural and industrial monitoring.",
        },
      },
      "hexa-rfid": {
        name: "RFID inventory system",
        role: "Software Developer, heXa Sistemas",
        years: "2016 — 2020",
        lede: "An annual inventory count that took five people twenty hours each. It now takes one person an afternoon.",
        facts: [
          { label: "Role", value: "Software Developer" },
          { label: "Stack", value: "RFID, GeneXus" },
          { label: "Before", value: "≈100 person-hours per count" },
          { label: "After", value: "≈3 person-hours per count" },
        ],
        sections: [
          {
            heading: "Context",
            body: [
              "A client counted their stock once a year the way most companies do: they closed, put five people on the floor with barcode scanners and printed sheets, and spent twenty hours reconciling what was found against what the system believed.",
              "It was expensive, it was disruptive, and — because it was exhausting — it was not especially accurate.",
            ],
          },
          {
            heading: "Constraint",
            body: [
              "Barcodes are the root of the problem. A barcode needs line of sight and one scan per item, which makes the count linear in the number of things being counted and puts a person in front of every one of them.",
              "Anything that replaced it had to survive a warehouse rather than a demo: items stacked behind other items, tags that get damaged, and staff who would use the system a handful of times a year and could not be expected to remember a procedure.",
            ],
          },
          {
            heading: "Approach",
            body: [
              "RFID removes the line-of-sight requirement — a reader picks up many tags at once, from a distance, through packaging. The count stops being a sequence of scans and becomes a sweep of the space.",
              "The software around it does the part that actually matters: taking the raw reads, resolving duplicates from tags seen more than once, reconciling the result against expected stock, and producing an exception report of what is missing, what is unexpected, and what is in the wrong place. Nobody reads a list of everything that was found. They read the list of what disagrees.",
            ],
          },
          {
            heading: "Outcome",
            body: [
              "The count went from five people for twenty hours to one person for roughly three — about a 97% reduction in effort — and from an annual ordeal to something that can be run whenever it is useful.",
              "It remains the clearest example I have of a result that came from changing the shape of the problem rather than optimising the existing solution.",
            ],
          },
        ],
        meta: {
          title: "RFID inventory system — 100 person-hours to 3",
          description:
            "Replacing a barcode-based annual stock count with RFID and a reconciliation pass, cutting it from roughly 100 person-hours to three.",
        },
      },
    },
  },
};
