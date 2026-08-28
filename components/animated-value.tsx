"use client";

import { useEffect, useRef, useState } from "react";

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
 * Counts up to a project's headline number when it scrolls into view.
 * Values without a `count` (a range, a word) render as-is.
 */
export function AnimatedValue({ result }: { result: Result }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number | null>(null);
  const { prefix, digits, suffix } = split(result.display);

  useEffect(() => {
    const node = ref.current;
    if (!node || result.count === undefined) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(result.count);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const target = result.count as number;
        const duration = 1100;
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          // easeOutExpo — quick off the mark, settles onto the number
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -9 * t);
          setValue(Math.round(target * eased));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [result.count]);

  const shown =
    result.count === undefined || value === null
      ? digits
      : value.toLocaleString("en-US");

  return (
    <span ref={ref} aria-label={`${result.display} ${result.label}`}>
      <span aria-hidden>
        {prefix}
        <span className="tabular-nums">{shown}</span>
        {suffix}
      </span>
    </span>
  );
}
