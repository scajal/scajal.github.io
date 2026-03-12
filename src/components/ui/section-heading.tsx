interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
        {eyebrow}
      </p>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--text-strong)]">
        {title}
      </h2>
      {intro ? (
        <p className="max-w-2xl text-sm md:text-base leading-relaxed text-[color:var(--text-muted)]">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

