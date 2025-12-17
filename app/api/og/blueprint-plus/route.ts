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
          width: "1200px",
          height: "630px",
          background: "white",
          padding: "60px",
          border: "8px solid #021859",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, Helvetica Neue, Arial",
          color: "#021859",
          position: "relative",
        }}
      >
        <img src={`${base}/assets/og/logo-wunderbar.svg`} width="180" />

        <div style={{ marginTop: "60px" }}>
          <div style={{ fontSize: "62px", fontWeight: 700 }}>Blueprint+™</div>
          <div style={{ fontSize: "30px", marginTop: "18px", maxWidth: "700px" }}>
            The full brand architecture your business needs — including tone, narrative, strategy,
            and AI-ready assets.
          </div>
        </div>

        <img
          src={`${base}/assets/og/blueprint-plus-bg.svg`}
          width="300"
          style={{ position: "absolute", right: "50px", bottom: "70px" }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}


