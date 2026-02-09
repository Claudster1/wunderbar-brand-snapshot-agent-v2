// app/preview/page.tsx
// Dev index: links to all report previews with mock data for design work.

import Link from "next/link";

export const dynamic = "force-dynamic";

const PREVIEWS = [
  {
    href: "/preview/results",
    title: "Brand Snapshot™ (Free)",
    description: "Executive summary, pillar scores, archetype, 3 immediate actions, soft CTA to Snapshot+.",
  },
  {
    href: "/preview/snapshot-plus",
    title: "Brand Snapshot+™ ($497)",
    description: "Priority diagnosis, pillar deep dives with examples, archetype system, audience clarity, action plan.",
  },
  {
    href: "/preview/blueprint",
    title: "Brand Blueprint™ ($997)",
    description: "Brand foundation, messaging system, visual direction, conversion strategy, AI prompt pack.",
  },
  {
    href: "/preview/blueprint-plus",
    title: "Brand Blueprint+™ ($1,997)",
    description: "Advanced segmentation, messaging matrix, campaign strategy, enterprise AI prompts, services CTA.",
  },
  {
    href: "/preview/report",
    title: "Legacy report",
    description: "Old report format (kept for reference).",
  },
] as const;

export default function PreviewIndexPage() {
  return (
    <main className="min-h-screen bg-brand-bg font-brand">
      <div className="bs-container-narrow bs-section max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="bs-h1 mb-2">Design previews</h1>
        <p className="bs-body-sm text-brand-muted mb-8">
          Mock data only. Use these to work on layout and styling without a real report.
          See <code className="bg-brand-navy/5 px-1.5 py-0.5 rounded text-sm">docs/PREVIEW_SAMPLE_REPORTS.md</code> for details.
        </p>
        <p className="bs-small text-brand-muted mb-6">
          If links do not load: stop any running dev server, then run <code className="bg-brand-navy/5 px-1 rounded">npm run dev:preview</code> and open <strong>http://localhost:3010/preview</strong>.
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
                <span className="bs-small text-brand-blue font-semibold mt-2 inline-block">
                  Open preview →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
