import Link from "next/link";

export type ReportOverviewTile = {
  id: string;
  label: string;
  description: string;
  href: string;
};

interface SectionOverviewTilesProps {
  productName: string;
  tiles: ReportOverviewTile[];
}

export function SectionOverviewTiles({ productName, tiles }: SectionOverviewTilesProps) {
  return (
    <section
      style={{
        border: "1px solid #D6DFE8",
        borderRadius: 12,
        background: "#FFFFFF",
        padding: 20,
        boxShadow: "0 8px 24px rgba(2,24,89,0.06)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#5A6B7E",
        }}
      >
        Report Overview
      </p>
      <h2
        style={{
          margin: "8px 0 10px",
          fontSize: 24,
          lineHeight: 1.2,
          color: "#021859",
        }}
      >
        Explore your {productName} sections
      </h2>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#2D3A4A" }}>
        Choose a section below to jump directly into the part of your report you want to review.
      </p>

      <div
        style={{
          display: "grid",
          gap: 12,
          marginTop: 18,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            style={{
              display: "block",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              padding: 14,
              textDecoration: "none",
              background: "#F8FAFC",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 15, color: "#021859" }}>{tile.label}</h3>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#07B0F2" }}>Open →</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "#5A6B7E" }}>
              {tile.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
