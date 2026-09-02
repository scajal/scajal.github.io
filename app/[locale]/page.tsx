import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatedValue } from "@/components/animated-value";
import { Section } from "@/components/section";
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { PROFILE, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return BUILT_LOCALES.map((locale) => ({ locale }));
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const content = getContent(locale as BuiltLocale);
  const { hero, work, ai, past, contact } = content;

  // One @graph rather than a bare Person: agents and rich-result parsers can
  // follow @id references from the page to the person to the work, which a
  // flat node does not let them do.
  const personId = `${SITE_URL}/#person`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/${locale}/#page`,
        url: `${SITE_URL}/${locale}/`,
        name: content.meta.title,
        description: content.meta.description,
        inLanguage: locale,
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: PROFILE.name,
        url: `${SITE_URL}/${locale}/`,
        jobTitle: "Tech Lead & Full-Stack Engineer",
        description: content.meta.description,
        email: `mailto:${PROFILE.email}`,
        knowsLanguage: BUILT_LOCALES as unknown as string[],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Montevideo",
          addressCountry: "UY",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "Universidad de la Empresa",
        },
        worksFor: hero.currently.map((item) => ({
          "@type": "Organization",
          name: item.org,
        })),
        knowsAbout: [
          "Laravel",
          "PHP",
          "React",
          "TypeScript",
          "Next.js",
          "Software architecture",
          "Fintech",
          "Cryptocurrency platforms",
          "LoRaWAN",
        ],
        sameAs: [PROFILE.linkedin, PROFILE.github],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/${locale}/#work`,
        name: work.title,
        itemListElement: work.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url: `${SITE_URL}/${locale}/work/${item.slug}/`,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main" className="flex-1">
        {/* Hero ------------------------------------------------ */}
        <div className="shell pb-[clamp(3.5rem,8vw,7rem)] pt-[clamp(3rem,9vw,7.5rem)]">
          <h1 className="display max-w-[15ch]">
            {hero.headline.map((line, i) => (
              <span
                key={line}
                className="kinetic-line"
                style={{ animationDelay: `${180 + i * 95}ms` }}
              >
                {line}
                {i === hero.headline.length - 1 && (
                  <span style={{ color: "var(--ink-accent)" }}>
                    {hero.headlineAccent}
                  </span>
                )}
              </span>
            ))}
          </h1>

          <p
            className="fade-up prose-body mt-8"
            style={{ animationDelay: `${180 + hero.headline.length * 95}ms` }}
          >
            {hero.subhead}
          </p>

          <dl
            className="fade-up mt-12 flex flex-col gap-2 border-t border-[var(--rule)] pt-6 sm:flex-row sm:gap-10"
            style={{ animationDelay: `${280 + hero.headline.length * 95}ms` }}
          >
            <dt className="eyebrow sm:pt-1">{hero.currentlyLabel}</dt>
            {hero.currently.map((item) => (
              <dd key={item.org} className="flex flex-col">
                <span className="tracking-tight" translate="no">
                  {item.org}
                </span>
                <span className="mono text-muted-foreground">{item.role}</span>
              </dd>
            ))}
          </dl>
        </div>

        {/* Selected work --------------------------------------- */}
        <Section id="work" eyebrow={work.eyebrow}>
          <h3 className="section-title">{work.title}</h3>
          <p className="prose-body mt-5">{work.intro}</p>

          <ul className="mt-12 flex flex-col">
            {work.items.map((item) => (
              <li key={item.slug} className="border-t border-[var(--rule)]">
                <Link
                  href={`/${locale}/work/${item.slug}`}
                  className="group grid gap-x-8 gap-y-3 py-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
                >
                  {/* The arrow sits in its own flex cell rather than inline
                      after the title: a long name — or a longer translation
                      of it — would otherwise orphan it onto its own line. */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-medium tracking-tight">
                        <span className="link decoration-transparent group-hover:decoration-[var(--ink-accent)]">
                          {item.name}
                        </span>
                      </h4>
                      <p className="mono mt-1 text-subtle-foreground">
                        {item.years}
                      </p>
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-1 group-hover:text-[var(--ink-accent)]"
                    />
                  </div>
                  <div>
                    <p className="text-[clamp(1.75rem,2.6vw,2.25rem)] font-medium leading-none tracking-[-0.04em]">
                      <AnimatedValue result={item.result} locale={locale} />
                    </p>
                    <p className="mono mt-2 text-muted-foreground">
                      {item.result.label}
                    </p>
                    <p className="prose-body mt-5 text-[1rem]">
                      {item.summary}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-1.5">
                      {item.tags.map((tag) => (
                        <li
                          key={tag}
                          translate="no"
                          className="mono rounded-sm border border-[var(--rule)] px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* How I work ------------------------------------------ */}
        <Section id="ai" eyebrow={ai.eyebrow}>
          <h3 className="section-title max-w-[20ch]">{ai.title}</h3>
          <div className="mt-6 flex flex-col gap-5">
            {ai.body.map((paragraph, index) => (
              <p key={index} className="prose-body">
                {paragraph}
              </p>
            ))}
          </div>
          <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-3">
            {ai.stack.map((row) => (
              <div
                key={row.label}
                className="border-t border-[var(--rule)] pt-4"
              >
                <dt className="eyebrow">{row.label}</dt>
                <dd className="mono mt-2 leading-relaxed text-muted-foreground">
                  {row.items}
                </dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Before ---------------------------------------------- */}
        <Section id="past" eyebrow={past.eyebrow}>
          <h3 className="section-title">{past.title}</h3>
          <ul className="mt-10 flex flex-col">
            {past.roles.map((role) => (
              <li
                key={role.org}
                className="grid gap-x-8 gap-y-1.5 border-t border-[var(--rule)] py-6 first:border-t-0 first:pt-0 md:grid-cols-[7rem_minmax(0,15rem)_minmax(0,1fr)]"
              >
                <p className="mono text-subtle-foreground">{role.period}</p>
                <div>
                  <p className="font-medium tracking-tight">{role.org}</p>
                  <p className="mono mt-1 text-muted-foreground">{role.role}</p>
                </div>
                <p className="prose-body text-[1rem]">{role.detail}</p>
              </li>
            ))}
          </ul>
          <p className="prose-body mt-8 border-t border-[var(--rule)] pt-6 text-[1rem]">
            {past.education}
          </p>
        </Section>

        {/* Contact --------------------------------------------- */}
        <Section id="contact" eyebrow={contact.eyebrow}>
          <h3 className="section-title">{contact.title}</h3>
          <p className="prose-body mt-5">{contact.body}</p>
          <ul className="mt-10 flex flex-col">
            {contact.links.map((link) => (
              <li key={link.label} className="border-t border-[var(--rule)]">
                <a
                  href={link.href}
                  className="group flex items-baseline justify-between gap-6 py-5"
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  <span className="text-lg tracking-tight">{link.label}</span>
                  <span className="mono text-muted-foreground transition-colors group-hover:text-[var(--ink-accent-text)]">
                    {link.note}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>
    </>
  );
}
