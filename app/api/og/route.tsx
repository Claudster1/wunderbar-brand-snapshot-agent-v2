// app/api/og/route.tsx
// Premium OG image generator (query-param driven)

import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Your Brand Snapshot™";
  const score = searchParams.get("score") || "--";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#F7F9FC",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "120px",
          fontFamily: "Helvetica",
        }}
      >
        <div style={{ fontSize: 64, margin: 0, color: "#021859", fontWeight: 700 }}>
          {name}
        </div>
        <div style={{ fontSize: 36, margin: "20px 0", color: "#0C1526" }}>
          Brand Alignment Score™: {score}
        </div>
        <div style={{ fontSize: 32, color: "#07B0F2" }}>
          Powered by Wunderbar Digital
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}


