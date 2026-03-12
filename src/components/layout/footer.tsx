import { portfolioContent } from "@/src/data/portfolio";

export function Footer() {
  const { footer } = portfolioContent;

  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/80 px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-[color:var(--text-muted-strong)] md:flex-row md:items-center md:justify-between">
        <p>{footer.mainLine}</p>
        {footer.secondaryLine ? (
          <p className="text-xs text-[color:var(--text-muted)]">
            {footer.secondaryLine}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

