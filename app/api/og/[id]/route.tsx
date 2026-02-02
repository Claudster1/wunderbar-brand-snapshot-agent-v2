// app/api/og/[id]/route.ts
// Open Graph image generation for Brand Snapshot results

import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return new Response("Supabase not configured", { status: 500 });
    }

    // Fetch report from database
    const { data: report } = await supabaseAdmin
      .from("brand_snapshot_reports")
      .select("brand_alignment_score, user_name, company_name")
      .eq("report_id", id)
      .single();

    const score = report?.brand_alignment_score || 0;
    const scoreLabel =
      score >= 80
        ? "Excellent"
        : score >= 60
        ? "Strong"
        : score >= 40
        ? "Developing"
        : "Needs Focus";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #07B0F2 0%, #27CDF2 50%, #021859 100%)",
            fontSize: 60,
            fontWeight: 700,
            color: "white",
            padding: "80px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {/* Wundy Icon Placeholder */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "80px",
                }}
              >
                🐾
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "72px",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Your Brand Snapshot™
            </div>

            {/* Score */}
            <div
              style={{
                fontSize: "120px",
                fontWeight: 800,
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              {score}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: "48px",
                fontWeight: 600,
                textAlign: "center",
                opacity: 0.9,
              }}
            >
              {scoreLabel} Alignment
            </div>

            {/* Footer */}
            <div
              style={{
                fontSize: "32px",
                fontWeight: 400,
                textAlign: "center",
                opacity: 0.8,
                marginTop: "40px",
              }}
            >
              Wunderbar Digital
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("[OG Image] Error:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}

