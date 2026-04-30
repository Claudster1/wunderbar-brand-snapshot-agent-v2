// app/preview/page.tsx
// Dev index: links to all report previews with mock data for design work.

import Link from "next/link";
import { headers } from "next/headers";

const PREVIEWS = [
  {
    href: "/preview/results-tabs",
    title: "Updated Results Tabs UI (Mock)",
    description: "New tabbed results shell: compact header, executive summary above tabs, activation/workbook/download flow.",
  },
  {
    href: "/preview/results",
    title: "WunderBrand Snapshot™ (Free)",
    description: "Executive summary, pillar scores, archetype, 3 immediate actions, soft CTA to Snapshot+.",
  },
  {
    href: "/preview/snapshot-plus",
    title: "WunderBrand Snapshot+™ ($497)",
    description: "Priority diagnosis, pillar deep dives with examples, archetype system, audience clarity, action plan.",
  },
  {
    href: "/preview/blueprint",
    title: "WunderBrand Blueprint™ ($997)",
    description: "Brand foundation, messaging system, visual direction, conversion strategy, AI prompt pack.",
  },
  {
    href: "/preview/blueprint-plus",
    title: "WunderBrand Blueprint+™ ($1,997)",
    description: "Advanced segmentation, messaging matrix, campaign strategy, enterprise AI prompts, services CTA.",
  },
  {
    href: "/preview/report",
    title: "Legacy report",
    description: "Old report format (kept for reference).",
  },
] as const;

const EXTRA_SAMPLE_PATHS = [
  { href: "/preview/results-tabs?tab=activation", label: "Results tabs — Activation tab only" },
  { href: "/preview/results-tabs/activation/paid-ads", label: "Full-page activation plan (paid ads; swap segment id in URL)" },
  { href: "/preview/pdf", label: "PDF preview shell" },
] as const;

export default async function PreviewIndexPage() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const proto =
    hdrs.get("x-forwarded-proto") || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  const base = host ? `${proto}://${host}` : "";

  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="bs-container-narrow bs-section max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="bs-h1 mb-2">Design previews</h1>
        <p className="bs-body-sm text-brand-muted mb-8">
          Mock data only. Use these to work on layout and styling without a real report. Paths are the same on every
          deployment; only the <strong>origin</strong> changes (local vs staging vs production).
        </p>

        {base ? (
          <section
            className="mb-8 rounded-xl border border-brand-border bg-white p-4 sm:p-5"
            aria-label="Absolute URLs for this host"
          >
            <p className="bs-body-sm font-bold text-brand-navy mb-2">Copy-paste links (this deployment)</p>
            <p className="bs-small text-brand-muted mb-3">
              On <strong>app.wunderbrand.ai</strong> (Vercel Production), <code className="rounded bg-brand-navy/5 px-1">/preview</code> is
              disabled by default for internal-only demos. Use a <strong>Vercel Preview</strong> URL, local dev, or set{" "}
              <code className="rounded bg-brand-navy/5 px-1">ENABLE_PREVIEW_ROUTES=true</code> on Production if you ever
              need previews on that host.
            </p>
            <ul className="space-y-2 text-sm break-all">
              {PREVIEWS.map((p) => (
                <li key={p.href}>
                  <a href={`${base}${p.href}`} className="text-brand-blue font-semibold hover:underline">
                    {base}
                    {p.href}
                  </a>
                  <span className="text-brand-muted"> — {p.title}</span>
                </li>
              ))}
              {EXTRA_SAMPLE_PATHS.map((p) => (
                <li key={p.href}>
                  <a href={`${base}${p.href}`} className="text-brand-blue font-semibold hover:underline">
                    {base}
                    {p.href}
                  </a>
                  <span className="text-brand-muted"> — {p.label}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="bs-small text-brand-muted mb-6">
          Local dev: <code className="bg-brand-navy/5 px-1 rounded">npm run dev</code> →{" "}
          <strong>http://localhost:3000/preview</strong> or <code className="bg-brand-navy/5 px-1 rounded">npm run dev:preview</code>{" "}
          → <strong>http://localhost:3010/preview</strong> (match the port to the command).
        </p>
        <ul className="space-y-4">
          {PREVIEWS.map(({ href, title, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="bs-card rounded-xl p-5 block border border-brand-navy/10 hover:border-brand-blue/30 hover:shadow-md transition-all"
              >
                <h2 className="bs-h3 mb-1">{title}</h2>
                <p className="bs-body-sm text-brand-muted">{description}</p>
                <span className="bs-small text-brand-blue font-semibold mt-2 inline-block">Open preview →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
