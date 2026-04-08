// Deprecated path: use /api/admin/regenerate-plus-reports (all paid tiers).
// Segment config must be literal here — Next/Turbopack cannot parse re-exported `dynamic` / `maxDuration`.
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export { GET, POST } from "../regenerate-plus-reports/route";
