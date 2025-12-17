import { ImageResponse } from "next/og";

export const runtime = "edge";

function baseUrl() {
  const url = process.env.NEXT_PUBLIC_BASE_URL || "https://brand-snapshot.vercel.app";
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
          padding: "60px",
          flexDirection: "column",
          background: "#021859",
          color: "white",
          fontFamily: "Inter, Helvetica Neue, Arial",
          position: "relative",
        }}
      >
        <img src={`${base}/assets/og/logo-wunderbar.svg`} width="180" />

        <div style={{ marginTop: "60px" }}>
          <div style={{ fontSize: "62px", fontWeight: 700 }}>Snapshot+™</div>
          <div style={{ fontSize: "32px", marginTop: "18px", opacity: 0.9 }}>
            Your personalized brand analysis. Expanded. Deepened. Action-ready.
          </div>
        </div>

        <img
          src={`${base}/assets/og/snapshot-plus-bg.svg`}
          width="380"
          style={{ position: "absolute", right: "50px", bottom: "70px" }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}


