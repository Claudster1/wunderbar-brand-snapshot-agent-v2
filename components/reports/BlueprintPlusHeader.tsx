import React from "react";

type HeaderNavItem = {
  id: string;
  label: string;
};

interface BlueprintPlusHeaderProps {
  productName: string;
  reportId: string;
  userEmail?: string;
  pdfHref: string;
  utmMedium: string;
  navItems?: HeaderNavItem[];
}

const BRAND_LOGO_SRC =
  "https://d268zs2sdbzvo0.cloudfront.net/66e09bd196e8d5672b143fb8_528e12f9-22c9-4c46-8d90-59238d4c8141_logo.webp";

export function BlueprintPlusHeader({
  productName,
  reportId,
  userEmail,
  pdfHref,
  utmMedium,
  navItems = [],
}: BlueprintPlusHeaderProps) {
  const workbookHref = userEmail
    ? `/workbook?reportId=${encodeURIComponent(reportId)}&email=${encodeURIComponent(userEmail)}`
    : `/workbook?reportId=${encodeURIComponent(reportId)}`;

  return (
    <section className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-brand-border">
        <a
          href={`https://wunderbardigital.com/?utm_source=wunderbrand_app&utm_medium=${utmMedium}&utm_campaign=brand_navigation&utm_content=report_header_logo`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center no-underline"
        >
          <img
            src={BRAND_LOGO_SRC}
            alt="Wunderbar Digital"
            width={160}
            height={26}
            style={{ width: 160, height: "auto", display: "block" }}
          />
        </a>
        <div className="flex flex-col items-end text-right">
          <span className="text-base sm:text-lg font-bold text-brand-navy leading-tight">{productName}</span>
          <span className="text-[11px] sm:text-xs text-brand-muted">
            Powered by <strong className="text-brand-blue">Wunderbar Digital</strong>
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-3">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-brand-blue text-white text-xs sm:text-sm font-bold no-underline"
          >
            Download PDF
          </a>
          <a
            href={`/refine/${encodeURIComponent(reportId)}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-brand-blue/30 text-brand-blue text-xs sm:text-sm font-bold no-underline"
          >
            Refine Analysis
          </a>
          <a
            href={workbookHref}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-brand-border text-brand-navy text-xs sm:text-sm font-bold no-underline"
          >
            Implementation Workbook
          </a>
        </div>

        {navItems.length > 0 && (
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-2.5 py-1.5 rounded-md text-xs font-bold text-brand-muted no-underline hover:text-brand-blue hover:bg-brand-blue/10"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
