"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { FullWidthRow } from "@/components/layout/full-width-row";
import { contactData } from "@/data/portfolio";
import { GridTile } from "@/components/ui/grid-tile";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
};

export function ContactGrid() {
  return (
    <>
      <FullWidthRow>
        <GridTile gridClassName="col-span-4 md:col-span-8 lg:col-span-12 border-b border-r border-[var(--border)]">
          <SectionHeading
            eyebrow={contactData.eyebrow}
            title={contactData.title}
            intro={contactData.paragraph}
          />
        </GridTile>
      </FullWidthRow>

      <FullWidthRow>
        <GridTile gridClassName="col-span-4 md:col-span-4 lg:col-span-12 border-b border-[var(--border)]">
          <div className="space-y-6" aria-label="Contact methods">
            <div className="flex flex-col gap-4">
              {contactData.methods.map((method) => {
                const Icon =
                  iconMap[method.icon as keyof typeof iconMap] ?? Mail;
                return (
                  <a
                    key={method.label}
                    href={method.href}
                    target={
                      method.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      method.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center gap-3 text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className="font-medium">{method.label}</span>
                  </a>
                );
              })}
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              {contactData.closingLine}
            </p>
          </div>
        </GridTile>
      </FullWidthRow>
    </>
  );
}
