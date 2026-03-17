"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { FullWidthRow } from "@/components/layout/full-width-row";
import { GridTile } from "@/components/ui/grid-tile";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ExpandableGridPopup } from "@/components/ui/expandable-grid-popup";
import { heroData, profileSummaryData, aboutPopupContent } from "@/data/portfolio";
import { popupTransition, heroContainer, heroItem } from "@/lib/motion";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
};

interface HeroGridProps {
  onAboutOpen?: () => void;
}

export function HeroGrid({ onAboutOpen }: HeroGridProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleAboutClick = () => {
    setAboutOpen(true);
    onAboutOpen?.();
  };

  return (
    <>
      <FullWidthRow>
        <GridTile
          gridClassName="col-span-4 md:col-span-7 lg:col-span-8 row-span-2 border-r border-b border-[var(--border)]"
        >
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.p
              variants={heroItem}
              className="text-sm font-medium tracking-wider uppercase text-[var(--accent)]"
            >
              {heroData.eyebrow}
            </motion.p>

            <motion.h1
              variants={heroItem}
              className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--text)] leading-[1.1]"
            >
              {heroData.headline}
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="text-lg text-[var(--text-muted)]"
              aria-label="Summary of expertise and focus areas"
            >
              {heroData.subheadline}
            </motion.p>

            <motion.p
              variants={heroItem}
              className="text-base text-[var(--text-muted)] leading-relaxed max-w-[60ch]"
            >
              {heroData.supportingLine}
            </motion.p>

            <motion.div variants={heroItem} className="flex flex-wrap gap-3 pt-2">
              <PrimaryButton href="#projects">View Projects</PrimaryButton>
              <PrimaryButton href="#contact" variant="secondary">
                Contact Me
              </PrimaryButton>
            </motion.div>

            <motion.div variants={heroItem} className="flex gap-4 pt-4">
              {heroData.socialLinks.map((link) => {
                const Icon = iconMap[link.icon as keyof typeof iconMap] ?? Mail;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-200"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </motion.div>
          </motion.div>
        </GridTile>

        <GridTile
          gridClassName="col-span-4 md:col-span-5 lg:col-span-4 row-span-2 border-b border-[var(--border)]"
          as="button"
          onClick={handleAboutClick}
        >
          {!aboutOpen ? (
            <motion.div
              layoutId="popup-about"
              transition={popupTransition}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col justify-center -m-6 md:-m-8 p-6 md:p-8"
            >
              <div className="space-y-4">
                <p className="text-sm font-medium text-[var(--accent)]">Profile</p>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[var(--text-muted)]">Role</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.role}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Experience</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.experience}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Focus</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.focus}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Industries</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.industries}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Core Stack</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.coreStack}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Approach</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.approach}</dd>
                  </div>
                </dl>
                <p className="text-sm font-medium text-[var(--accent)] pt-2">
                  {profileSummaryData.actionLabel} →
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col justify-center -m-6 md:-m-8 p-6 md:p-8">
              <div className="space-y-4 opacity-50">
                <p className="text-sm font-medium text-[var(--accent)]">Profile</p>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[var(--text-muted)]">Role</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.role}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Experience</dt>
                    <dd className="font-medium text-[var(--text)]">{profileSummaryData.experience}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </GridTile>
      </FullWidthRow>

      <ExpandableGridPopup
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        layoutId="popup-about"
        title="About"
      >
        <div className="space-y-6 max-w-[65ch]">
          {aboutPopupContent.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-base text-[var(--text)] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </ExpandableGridPopup>
    </>
  );
}
