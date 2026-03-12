"use client";
import { portfolioContent } from "@/src/data/portfolio";
import { GlassPanel } from "@/src/components/ui/glass-panel";
import { PrimaryButton } from "@/src/components/ui/primary-button";

export function HeroSection() {
  const { hero } = portfolioContent;

  return (
    <section
      id="home"
      className="scroll-mt-28 px-4 pt-28 pb-10 md:px-6 md:pt-32 md:pb-14 lg:pt-36"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-start md:gap-10">
        <div className="space-y-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            {hero.eyebrow}
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[color:var(--text-strong)]">
              {hero.headline}
            </h1>
            <p className="text-sm md:text-base font-medium text-[color:var(--text-muted-strong)]">
              {hero.subheadline}
            </p>
            <p className="max-w-xl text-sm md:text-base leading-relaxed text-[color:var(--text-muted)]">
              {hero.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <PrimaryButton
              onClick={() => {
                const el = document.getElementById("projects");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {hero.primaryCtaLabel}
            </PrimaryButton>
            <PrimaryButton
              variant="ghost"
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {hero.secondaryCtaLabel}
            </PrimaryButton>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[color:var(--text-muted-strong)]">
            {hero.socialLinks.map((link) => (
              <a
                key={link.type}
                href={link.href}
                target={link.type === "email" ? undefined : "_blank"}
                rel={link.type === "email" ? undefined : "noreferrer"}
                className="relative inline-flex items-center gap-2 text-xs font-medium tracking-tight text-[color:var(--text-muted-strong)] transition-colors hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
              >
                <span className="h-[1px] w-6 bg-[color:var(--accent-soft)]" />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        <GlassPanel variant="elevated" className="p-6 md:p-7 lg:p-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
              Snapshot
            </p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
              {hero.summaryItems.map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <dt className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-[color:var(--text-primary)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

