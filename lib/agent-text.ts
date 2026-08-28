/**
 * Plain-text mirrors of the site for agents and LLM crawlers.
 *
 * The rendered pages are the source of truth for humans; these render the same
 * `content/` dictionaries as Markdown so an agent can read a page in one fetch
 * instead of executing the app and scraping the DOM. Everything here is
 * derived — there is no second copy of the copy to keep in sync.
 */
import { BUILT_LOCALES, getContent, type BuiltLocale } from "@/content";
import { CASE_SLUGS, type CaseSlug } from "@/content/types";
import { PROFILE, SITE_URL } from "@/lib/site";

export const pageUrl = (locale: string) => `${SITE_URL}/${locale}/`;
export const pageMd = (locale: string) => `${SITE_URL}/${locale}/index.md`;
export const caseUrl = (locale: string, slug: string) =>
  `${SITE_URL}/${locale}/work/${slug}/`;
export const caseMd = (locale: string, slug: string) =>
  `${SITE_URL}/${locale}/work/${slug}/index.md`;

/** Joins with newlines, dropping conditional entries but keeping blank lines. */
function lines(...parts: (string | false | undefined)[]) {
  return parts.filter((part) => typeof part === "string").join("\n");
}

function contactBlock(locale: BuiltLocale) {
  const { contact } = getContent(locale);
  return lines(
    `## ${contact.title}`,
    "",
    contact.body,
    "",
    `- Email: ${PROFILE.email}`,
    `- LinkedIn: ${PROFILE.linkedin}`,
    `- GitHub: ${PROFILE.github}`,
    `- Location: ${PROFILE.location}`,
  );
}

/** The home page, as Markdown. Mirrors app/[locale]/page.tsx section for section. */
export function homeMarkdown(locale: BuiltLocale): string {
  const { meta, hero, work, ai, past } = getContent(locale);

  const currently = hero.currently
    .map((item) => `- ${item.org} — ${item.role}`)
    .join("\n");

  const workItems = work.items
    .map((item) =>
      lines(
        `### ${item.name} (${item.years})`,
        "",
        `${item.result.display} ${item.result.label}.`,
        "",
        item.summary,
        "",
        `- Stack: ${item.tags.join(", ")}`,
        `- Case study: ${caseUrl(locale, item.slug)}`,
        `- Case study (Markdown): ${caseMd(locale, item.slug)}`,
      ),
    )
    .join("\n\n");

  const roles = past.roles
    .map((role) =>
      `- **${role.org}** — ${role.role} (${role.period}). ${role.detail}`,
    )
    .join("\n");

  return lines(
    `# ${meta.title}`,
    "",
    `> ${meta.description}`,
    "",
    `- Canonical page: ${pageUrl(locale)}`,
    `- Language: ${locale}`,
    `- Location: ${PROFILE.location}`,
    "",
    `${hero.headline.join(" ")}${hero.headlineAccent}`,
    "",
    hero.subhead,
    "",
    `### ${hero.currentlyLabel}`,
    "",
    currently,
    "",
    `## ${work.title}`,
    "",
    work.intro,
    "",
    workItems,
    "",
    `## ${ai.title}`,
    "",
    ai.body.join("\n\n"),
    "",
    ...ai.stack.map((row) => `- ${row.label}: ${row.items}`),
    "",
    `## ${past.title}`,
    "",
    roles,
    "",
    past.education,
    "",
    contactBlock(locale),
    "",
  );
}

/** A single case study, as Markdown. Mirrors app/[locale]/work/[slug]/page.tsx. */
export function caseMarkdown(locale: BuiltLocale, slug: CaseSlug): string {
  const study = getContent(locale).cases.studies[slug];

  const facts = study.facts
    .map((fact) => `- ${fact.label}: ${fact.value}`)
    .join("\n");

  const sections = study.sections
    .map((section) => `## ${section.heading}\n\n${section.body.join("\n\n")}`)
    .join("\n\n");

  return lines(
    `# ${study.name}`,
    "",
    `> ${study.lede}`,
    "",
    `- Canonical page: ${caseUrl(locale, slug)}`,
    `- Years: ${study.years}`,
    // `facts` already carries the role, stack and status, localised.
    facts,
    "",
    sections,
    "",
    `---`,
    "",
    `Part of ${pageUrl(locale)}`,
    "",
  );
}

/**
 * /llms.txt — the discovery index, per the llms.txt convention: a title, a
 * summary, then link sections an agent can fan out from.
 */
export function llmsIndex(): string {
  const { meta } = getContent("en");

  const perLocale = BUILT_LOCALES.map((locale) => {
    const content = getContent(locale);
    const cases = CASE_SLUGS.map(
      (slug) =>
        `- [${content.cases.studies[slug].name}](${caseMd(locale, slug)}): ${
          content.cases.studies[slug].meta.description
        }`,
    ).join("\n");

    return lines(
      `## ${locale === "en" ? "English" : "Español"} (${locale})`,
      "",
      `- [${content.meta.title}](${pageMd(locale)}): ${content.meta.description}`,
      cases,
      `- [Everything, one file](${SITE_URL}/${locale}/llms-full.txt): the page and all case studies concatenated.`,
    );
  }).join("\n\n");

  return lines(
    `# ${PROFILE.name}`,
    "",
    `> ${meta.description}`,
    "",
    `Every page below is available as Markdown at the same URL with \`index.md\` appended, so no rendering or scraping is required. HTML pages carry the same content plus schema.org JSON-LD.`,
    "",
    perLocale,
    "",
    "## Contact",
    "",
    `- Email: ${PROFILE.email}`,
    `- LinkedIn: ${PROFILE.linkedin}`,
    `- GitHub: ${PROFILE.github}`,
    `- Location: ${PROFILE.location}`,
    "",
  );
}

/** /[locale]/llms-full.txt — the whole locale in one fetch. */
export function llmsFull(locale: BuiltLocale): string {
  return [
    homeMarkdown(locale),
    ...CASE_SLUGS.map((slug) => caseMarkdown(locale, slug)),
  ].join("\n---\n\n");
}
