interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="text-sm font-medium tracking-wider uppercase text-[var(--accent)] mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text)] mb-3">
        {title}
      </h2>
      {intro && (
        <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-[65ch]">
          {intro}
        </p>
      )}
    </div>
  );
}
