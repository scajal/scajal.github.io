import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-label`} className="section">
      <div className="shell section-grid">
        <h2 id={`${id}-label`} className="eyebrow lg:pt-2">
          {eyebrow}
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
}
