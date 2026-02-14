import { ImageResponse } from "next/og";

export const runtime = "edge";

function baseUrl() {
  // Use NEXT_PUBLIC_BASE_URL if set, otherwise try Vercel's automatic URL, then fallback
  const url = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "https://brand-snapshot.vercel.app";
  return url.replace(/\/$/, "");
}

export async function GET() {
  const base = baseUrl();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          background: "#F5F7FB",
          padding: "60px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Inter, Helvetica Neue, Arial",
          position: "relative",
        }}
      >
        <img
          src={`${base}/assets/og/logo-wunderbar.svg`}
          width="180"
          style={{ opacity: 0.9 }}
        />

        <div style={{ marginTop: "60px" }}>
          <div
            style={{
              fontSize: "62px",
              color: "#021859",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            WunderBrand Snapshot™
          </div>
          <div
            style={{
              fontSize: "32px",
              marginTop: "18px",
              color: "#0C1526",
              opacity: 0.9,
            }}
          >
            Uncover your WunderBrand Score™ in minutes.
          </div>
        </div>

        <img
          src={`${base}/assets/og/wundy-outline.svg`}
          width="200"
          style={{ position: "absolute", bottom: "40px", right: "40px" }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}


