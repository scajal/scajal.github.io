import { footerData } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,64rem)_1fr] w-full min-w-0 bg-[var(--background)]">
      <div
        className="hidden md:block border-r border-[var(--border)] border-dashed min-h-[1px]"
        aria-hidden
      />
      <div className="min-w-0 px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <p className="text-sm font-medium text-[var(--text)]">
          {footerData.mainLine}
        </p>
        {footerData.secondaryLine && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {footerData.secondaryLine}
          </p>
        )}
      </div>
      <div
        className="hidden md:block border-l border-[var(--border)] border-dashed min-h-[1px]"
        aria-hidden
      />
    </footer>
  );
}
