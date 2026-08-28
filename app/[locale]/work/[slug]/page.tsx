import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getContent, type BuiltLocale } from "@/content";
import { CASE_SLUGS, type CaseSlug } from "@/content/types";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }));
}

function isCaseSlug(slug: string): slug is CaseSlug {
  return (CASE_SLUGS as readonly string[]).includes(slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isCaseSlug(slug)) return {};
  const study = getContent(locale as BuiltLocale).cases.studies[slug];

  return {
    title: study.meta.title,
    description: study.meta.description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: {
        en: `/en/work/${slug}`,
        es: `/es/work/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      locale,
      url: `${SITE_URL}/${locale}/work/${slug}`,
      title: study.meta.title,
      description: study.meta.description,
    },
  };
}

export default async function CaseStudy({
  params,
}: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  if (!isCaseSlug(slug)) notFound();

  const content = getContent(locale as BuiltLocale);
  const { backToWork, nextLabel, studies } = content.cases;
  const study = studies[slug];

  const order = CASE_SLUGS;
  const next = order[(order.indexOf(slug) + 1) % order.length];

  return (
    <main id="main" className="flex-1">
      <div className="shell pb-[clamp(2.5rem,6vw,5rem)] pt-[clamp(1.5rem,4vw,3rem)]">
        <Link
          href={`/${locale}#work`}
          className="mono inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {backToWork}
        </Link>

        <p className="mono mt-12 text-subtle-foreground">{study.years}</p>
        <h1 className="display mt-3 max-w-[14ch]">
          <span className="kinetic-line" style={{ animationDelay: "60ms" }}>
            {study.name}
          </span>
        </h1>
        <p
          className="fade-up prose-body mt-7 text-lg"
          style={{ animationDelay: "180ms" }}
        >
          {study.lede}
        </p>
      </div>

      {/* Facts ------------------------------------------------- */}
      <section aria-label={study.role} className="section">
        <div className="shell">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {study.facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1.5">
                <dt className="eyebrow">{fact.label}</dt>
                <dd className="text-[0.9375rem] leading-snug">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Context / Constraint / Approach / Outcome -------------- */}
      {study.sections.map((section) => (
        <section
          key={section.heading}
          aria-labelledby={`s-${section.heading}`}
          className="section"
        >
          <div className="shell section-grid">
            <h2 id={`s-${section.heading}`} className="eyebrow lg:pt-2">
              {section.heading}
            </h2>
            <div className="flex flex-col gap-5">
              {section.body.map((paragraph, index) => (
                <p key={index} className="prose-body">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Next -------------------------------------------------- */}
      <section aria-label={nextLabel} className="section">
        <div className="shell">
          <Link
            href={`/${locale}/work/${next}`}
            className="group flex items-end justify-between gap-6"
          >
            <span className="flex flex-col gap-2">
              <span className="eyebrow">{nextLabel}</span>
              <span className="section-title">
                <span className="link decoration-transparent group-hover:decoration-[var(--ink-accent)]">
                  {studies[next].name}
                </span>
              </span>
            </span>
            <ArrowUpRight
              aria-hidden
              className="mb-1.5 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-1 group-hover:text-[var(--ink-accent)]"
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
