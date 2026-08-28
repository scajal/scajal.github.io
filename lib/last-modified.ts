import { execFileSync } from "node:child_process";

/**
 * Date of the last commit to touch any of `paths`, as an ISO string.
 *
 * `lastmod` is a crawl-priority signal, so it has to mean "this page changed".
 * Stamping `new Date()` at build time would claim every page changed on every
 * deploy, which is the fastest way to get the signal ignored. Git is the only
 * build-time source of truth for it — hence `fetch-depth: 0` in the deploy
 * workflow, since a shallow clone has no per-file history.
 *
 * Returns undefined when git is unavailable or knows nothing about the paths,
 * so the caller omits `lastmod` rather than publishing a wrong one.
 */
export function gitLastModified(paths: string[]): string | undefined {
  const dates = paths.flatMap((path) => {
    try {
      const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", path], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      return out ? [out] : [];
    } catch {
      return [];
    }
  });

  // Compare as instants: %cI carries the committer's local offset, so two ISO
  // strings from different timezones do not sort correctly as text.
  return dates.reduce<string | undefined>(
    (latest, date) =>
      latest === undefined || Date.parse(date) > Date.parse(latest)
        ? date
        : latest,
    undefined,
  );
}
