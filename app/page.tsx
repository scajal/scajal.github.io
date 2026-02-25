import Link from "next/link";
import { ContactForm } from "./components/ContactForm";

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8" aria-label="Main">
        <Link
          href="#"
          className="font-semibold tracking-tight text-zinc-100"
        >
          Santiago Cajal
        </Link>
        <ul className="flex gap-8 text-sm font-medium text-zinc-400">
          <li>
            <Link
              href="#about"
              className="transition-colors hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="#projects"
              className="transition-colors hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              className="transition-colors hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center max-w-7xl mx-auto px-4 py-16 md:px-8 md:py-24">
      <div>
        <h1 className="text-3xl font-semibold tracking-tighter leading-tight text-zinc-50 md:text-4xl lg:text-5xl max-w-[22ch]">
          <span className="block">Bachelor&apos;s Degree in Computer Science</span>
          <span className="block">Full-Stack Development</span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-zinc-400 leading-relaxed max-w-[65ch]">
          8+ years building end-to-end products, payment integrations, and scalable platforms. Specialized in Laravel and modern JavaScript—architecture, team coordination, and business outcomes.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="#projects"
            className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-5 py-3 font-medium text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.98]"
          >
            View projects
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-600 px-5 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded-lg"
          >
            Get in touch
          </Link>
        </div>
      </div>
      <div className="relative hidden md:block aspect-[4/3] max-w-xl rounded-2xl bg-gradient-to-br from-teal-600/20 to-zinc-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_70%_20%,rgba(20,184,166,0.15),transparent)]" />
      </div>
    </section>
  );
}

const projects = [
  {
    id: "criptala",
    name: "Criptala",
    role: "Development Lead",
    description:
      "Cryptocurrency buying and selling platform, corporate website, and blog. Payment gateways (fiat and crypto), architecture and database design, Laravel and React/Inertia. Roadmap, requirements, and team coordination.",
    image: "https://picsum.photos/seed/criptala/800/500",
    outcomes: ["Payment gateways integrated", "Full platform architecture", "Team coordination"],
  },
  {
    id: "rabbit-agro",
    name: "Rabbit Agro",
    role: "Development Lead",
    description:
      "IoT platform based on LoRaWAN for agricultural monitoring. Telemetry ingestion, dashboards, real-time alerts. Multi-tenant architecture for multiple clients and farms. Built for scalability, low power, and reliability in rural environments.",
    image: "https://picsum.photos/seed/rabbitagro/800/500",
    outcomes: ["Multi-tenant IoT platform", "Real-time dashboards and alerts", "Rural reliability"],
  },
];

function Projects() {
  return (
    <section id="projects" className="max-w-7xl mx-auto px-4 py-20 md:px-8 md:py-28" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="sr-only">
        Featured projects
      </h2>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        {projects.map((project, i) => (
          <article
            key={project.id}
            className={`group flex flex-col ${i === 1 ? "md:mt-24" : ""}`}
          >
            <div className="block overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
              <img
                src={project.image}
                alt=""
                className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                width={800}
                height={500}
              />
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold tracking-tight text-zinc-100">
                  {project.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-teal-400">
                  {project.role}
                </p>
                <p className="mt-4 text-base text-zinc-400 leading-relaxed max-w-[65ch]">
                  {project.description}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Outcomes">
                  {project.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="rounded-full bg-zinc-700 px-3 py-1 text-sm text-zinc-300"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutCta() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 md:px-8 md:py-28" aria-labelledby="cta-heading">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-10 text-center md:p-16">
        <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
          Want to know more about me?
        </h2>
        <p className="mx-auto mt-4 max-w-[45ch] text-base text-zinc-400 leading-relaxed">
          See my background, experience, and how I work.
        </p>
        <Link
          href="#about"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-[0.98]"
        >
          About me
        </Link>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="max-w-7xl mx-auto px-4 py-20 md:px-8 md:py-28" aria-labelledby="about-heading">
      <h2 id="about-heading" className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
        About
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        <div className="max-w-[65ch]">
          <p className="text-base text-zinc-400 leading-relaxed">
            Full-Stack Development Lead specialized in Laravel and modern JavaScript (React, Vue, Next.js). I lead end-to-end product development—from architecture and database design to payment gateway integrations and team coordination. Strong focus on quality, scalability, and business outcomes.
          </p>
        </div>
        <dl className="space-y-4 text-base">
          <div>
            <dt className="font-medium text-zinc-100">Languages</dt>
            <dd className="mt-1 text-zinc-400">Spanish (native), English (advanced)</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-100">Location</dt>
            <dd className="mt-1 text-zinc-400">Montevideo, Uruguay (UTC-3)</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

const techItems = [
  "PHP / Laravel",
  "MySQL",
  "JavaScript / TypeScript",
  "React / Vue / Next.js / Nuxt",
  "Inertia.js",
  "TailwindCSS",
  "WordPress",
  "GeneXus",
];

function TechStack() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 md:px-8 md:py-28" aria-labelledby="tech-heading">
      <h2 id="tech-heading" className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
        Tech stack
      </h2>
      <ul className="mt-8 flex flex-wrap gap-3" role="list">
        {techItems.map((tech) => (
          <li
            key={tech}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300"
          >
            {tech}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 py-20 md:px-8 md:py-28" aria-labelledby="contact-heading">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 id="contact-heading" className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">
            Have a project in mind?
          </h2>
          <p className="mt-4 max-w-[45ch] text-base text-zinc-400 leading-relaxed">
            Contact me to discuss your next product or integration.
          </p>
          <div className="mt-8 space-y-4 text-base">
            <p>
              <a
                href="mailto:s.cajalvarela@gmail.com"
                className="font-medium text-teal-400 underline decoration-teal-500/30 underline-offset-2 hover:decoration-teal-400"
              >
                s.cajalvarela@gmail.com
              </a>
            </p>
            <p>
              <a
                href="tel:+59891859235"
                className="font-medium text-teal-400 underline decoration-teal-500/30 underline-offset-2 hover:decoration-teal-400"
              >
                +598 91 859 235
              </a>
            </p>
            <div className="flex gap-6 pt-2">
              <a
                href="https://linkedin.com/in/scajal"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-300 hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/scajal"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-300 hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-md">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-medium text-zinc-100">
              Have a project in mind?
            </p>
            <Link
              href="#contact"
              className="mt-1 inline-block font-medium text-teal-400 hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded"
            >
              Contact me
            </Link>
          </div>
          <nav aria-label="Footer">
            <ul className="flex gap-8 text-sm font-medium text-zinc-400">
              <li>
                <Link href="#about" className="hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded">
                  About
                </Link>
              </li>
              <li>
                <Link href="#projects" className="hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-900 rounded">
                  Projects
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-10 text-sm text-zinc-400">
          © 2026 Santiago Cajal. All rights reserved.
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Based in Uruguay
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Nav />
      <main>
        <Hero />
        <Projects />
        <AboutCta />
        <About />
        <TechStack />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
