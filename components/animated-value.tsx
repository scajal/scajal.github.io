type Result = { count?: number; display: string; label: string };

/** Splits "6,000+" into ["", "6,000", "+"] so only the number animates. */
function split(display: string) {
  const match = display.match(/[\d.,]+/);
  if (!match) return { prefix: display, digits: "", suffix: "" };
  const start = match.index ?? 0;
  return {
    prefix: display.slice(0, start),
    digits: match[0],
    suffix: display.slice(start + match[0].length),
  };
}

/**
 * Renders a project's headline number. Count-up is applied by `enhanceScript`
 * when the node scrolls into view — no client component, no hydration.
 */
export function AnimatedValue({
  result,
  locale,
}: {
  result: Result;
  locale: string;
}) {
  const { prefix, digits, suffix } = split(result.display);

  return (
    <span aria-label={`${result.display} ${result.label}`}>
      <span aria-hidden>
        {prefix}
        <span
          className="tabular-nums"
          {...(result.count !== undefined
            ? { "data-count": result.count, "data-locale": locale }
            : {})}
        >
          {digits}
        </span>
        {suffix}
      </span>
    </span>
  );
}
