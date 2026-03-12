import { portfolioContent } from "@/src/data/portfolio";

export function CredibilityStrip() {
  const { credibility } = portfolioContent;

  return (
    <section className="px-4 pb-8 md:px-6 md:pb-12">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/70 px-5 py-4 text-xs text-[color:var(--text-muted-strong)] shadow-[0_16px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl md:px-6 md:py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-0">
          {credibility.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 md:justify-center"
            >
              <span className="h-[3px] w-[18px] rounded-full bg-[color:var(--accent-soft)]" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

