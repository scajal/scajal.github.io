import { portfolioContent } from "@/src/data/portfolio";
import { SectionShell } from "@/src/components/layout/section-shell";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { GlassPanel } from "@/src/components/ui/glass-panel";

export function ContactSection() {
  const { contactSection } = portfolioContent;

  return (
    <SectionShell id="contact" className="pb-20 md:pb-24">
      <SectionHeading
        eyebrow={contactSection.eyebrow}
        title={contactSection.title}
      />
      <GlassPanel variant="elevated" className="max-w-3xl p-6 md:p-7 lg:p-8">
        <div className="space-y-5">
          <p className="text-sm md:text-base leading-relaxed text-[color:var(--text-muted)]">
            {contactSection.body}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-[color:var(--text-muted-strong)]">
            {contactSection.socialLinks.map((link) => (
              <a
                key={link.type}
                href={link.href}
                target={link.type === "email" ? undefined : "_blank"}
                rel={link.type === "email" ? undefined : "noreferrer"}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/70 px-4 py-2 text-xs font-medium tracking-tight transition-colors hover:bg-[color:var(--surface)]/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
              >
                <span className="h-[3px] w-[14px] rounded-full bg-[color:var(--accent-soft)]" />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
          <p className="text-xs md:text-sm text-[color:var(--text-muted-strong)]">
            {contactSection.closingLine}
          </p>
        </div>
      </GlassPanel>
    </SectionShell>
  );
}

