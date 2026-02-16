import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 300,
          color: "#07B0F2",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#021859",
          margin: "0 0 12px",
          letterSpacing: "-0.5px",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#5A6B7E",
          maxWidth: 440,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}
      >
        The page you're looking for doesn't exist or may have been moved. Let's
        get you back on track.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 24px",
            borderRadius: 6,
            background: "#07B0F2",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
        >
          Start a WunderBrand Snapshot™
        </Link>
        <Link
          href="https://wunderbardigital.com/wunderbrand-suite?utm_source=brand_snapshot_app&utm_medium=404_page&utm_campaign=navigation&utm_content=explore_suite"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            padding: "0 24px",
            borderRadius: 6,
            border: "2px solid #07B0F2",
            background: "transparent",
            color: "#07B0F2",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          Explore WunderBrand Suite™
        </Link>
      </div>
    </main>
  );
}
