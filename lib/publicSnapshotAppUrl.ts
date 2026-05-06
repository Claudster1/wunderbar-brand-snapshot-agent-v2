/**
 * Canonical URL for the deployed diagnostic app (embeds, postMessage origin checks, defaults).
 * Prefer NEXT_PUBLIC_BASE_URL in env; never pin an old *.vercel.app deployment hash.
 */
export const PUBLIC_SNAPSHOT_APP_ORIGIN =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")) ||
  "https://app.wunderbrand.ai";

export function publicSnapshotAppUrl(path = "/"): string {
  const base = PUBLIC_SNAPSHOT_APP_ORIGIN.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p === "//" ? "/" : p}`;
}
