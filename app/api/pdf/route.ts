// app/api/pdf/route.ts
// Unified PDF generation API route
// Supports all document types: snapshot, snapshot-plus, blueprint, blueprint-plus
// Can generate from report ID or inline data

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseServer } from "@/lib/supabase";
import {
  generatePdfResponseFromReport,
  generatePdfResponse,
  type PDFDocumentType,
} from "@/src/pdf/generatePdf";

export const dynamic = "force-dynamic";

const SAMPLE_REPORTS_BY_TYPE: Record<PDFDocumentType, Record<string, any>> = {
  snapshot: {
    "sample-ecommerce": {
      report_id: "sample-ecommerce",
      company_name: "Lumen & Co.",
      user_name: "Casey",
      user_email: "sample@wunderbar.ai",
      brand_alignment_score: 58,
      pillar_scores: {
        positioning: 61,
        messaging: 57,
        visibility: 62,
        credibility: 55,
        conversion: 52,
      },
      pillar_insights: {
        positioning:
          "Your visual identity is distinctive and recognizable, but your unique value is not explicit enough in product copy.",
        messaging:
          "Tone is on-brand and consistent, while product pages still need clearer problem-solution framing.",
        visibility:
          "Organic and social traffic volume is healthy, but channel mix is not prioritized by conversion quality.",
        credibility:
          "Customer sentiment is positive, but trust signals are buried below the fold on key pages.",
        conversion:
          "Cart initiation is acceptable, but checkout friction and weak urgency cues reduce completion rate.",
      },
      recommendations: {
        positioning: "Clarify your differentiation at the top of each high-intent product page.",
        messaging: "Lead with customer outcomes before feature detail blocks.",
        visibility: "Prioritize two channels by profitability rather than reach.",
        credibility: "Move reviews and proof badges higher in the purchase journey.",
        conversion: "Reduce checkout friction and tighten urgency language.",
      },
      full_report: {
        answers: {
          businessType: "ecommerce",
          likelyArchetype: "Creator",
          monthlyMarketingBudget: "5000_plus",
          monthlyRevenueRange: "50k_150k",
          revenueRange: "1M-5M",
          averageTransactionValue: "95",
          conversionRateEstimate: "2.3%",
        },
      },
    },
  },
  "snapshot-plus": {
    "sample-ecommerce": {
      business_name: "Lumen & Co.",
      user_name: "Casey",
      industry: "Ecommerce",
      brand_alignment_score: 64,
      pillar_scores: {
        positioning: 15,
        messaging: 13,
        visibility: 14,
        credibility: 12,
        conversion: 10,
      },
      pillar_insights: {
        positioning: "Distinctive identity, but product-level differentiation needs sharper framing.",
        messaging: "Tone is strong, but key objections are not resolved early enough.",
        visibility: "Traffic is healthy; channel prioritization by profitability is the next lever.",
        credibility: "Trust proof exists, but appears too late in the journey.",
        conversion: "Checkout and next-step sequencing are suppressing completion.",
      },
      enriched_persona:
        "Style-conscious buyers who convert when trust and clarity are visible before checkout friction.",
      enriched_archetype: {
        name: "The Creator",
        summary:
          "Your edge is identity and expression. Pair it with explicit commercial proof to improve conversion confidence.",
      },
      enriched_voice: {
        summary:
          "Expressive and premium, with clearer outcome framing and confidence-building proof.",
        pillars: ["Aspirational", "Specific", "Trust-building"],
      },
      enriched_color_palette: [
        { name: "Brand Blue", hex: "#07B0F2", role: "Primary", meaning: "Clarity and action" },
        { name: "Midnight", hex: "#021859", role: "Anchor", meaning: "Trust and depth" },
      ],
      opportunities_map:
        "Top opportunities: trust-first merchandising, objection-aware product copy, and checkout friction reduction.",
      roadmap_30: "Improve product-page proof hierarchy and tighten CTA clarity.",
      roadmap_60: "Refactor top categories by conversion quality and buyer intent stage.",
      roadmap_90: "Scale profitable channels with standardized conversion playbooks.",
      content_format_channel_snapshot:
        "Blend social proof reels, creator stories, and comparison-focused PDP modules.",
      marketing_spend_audit_signal:
        "Reallocate spend from broad reach to high-intent retargeting and trust-led conversion assets.",
      competitive_vulnerability_signal:
        "Competitors that surface social proof earlier will continue to win checkout confidence.",
      revenue_impact_statement:
        "Reducing checkout friction and improving trust visibility can materially improve ROAS and margin.",
      brand_opportunities:
        "Unify brand expression with conversion architecture so creative strength also drives revenue efficiency.",
      full_report: {},
      user_email: "sample@wunderbar.ai",
    },
    "sample-ecommerce-plus": {
      business_name: "Lumen & Co.",
      user_name: "Casey",
      industry: "Ecommerce",
      brand_alignment_score: 64,
      pillar_scores: {
        positioning: 15,
        messaging: 13,
        visibility: 14,
        credibility: 12,
        conversion: 10,
      },
      pillar_insights: {
        positioning: "Distinctive identity, but product-level differentiation needs sharper framing.",
        messaging: "Tone is strong, but key objections are not resolved early enough.",
        visibility: "Traffic is healthy; channel prioritization by profitability is the next lever.",
        credibility: "Trust proof exists, but appears too late in the journey.",
        conversion: "Checkout and next-step sequencing are suppressing completion.",
      },
      enriched_persona:
        "Style-conscious buyers who convert when trust and clarity are visible before checkout friction.",
      enriched_archetype: {
        name: "The Creator",
        summary:
          "Your edge is identity and expression. Pair it with explicit commercial proof to improve conversion confidence.",
      },
      enriched_voice: {
        summary:
          "Expressive and premium, with clearer outcome framing and confidence-building proof.",
        pillars: ["Aspirational", "Specific", "Trust-building"],
      },
      enriched_color_palette: [
        { name: "Brand Blue", hex: "#07B0F2", role: "Primary", meaning: "Clarity and action" },
        { name: "Midnight", hex: "#021859", role: "Anchor", meaning: "Trust and depth" },
      ],
      opportunities_map:
        "Top opportunities: trust-first merchandising, objection-aware product copy, and checkout friction reduction.",
      roadmap_30: "Improve product-page proof hierarchy and tighten CTA clarity.",
      roadmap_60: "Refactor top categories by conversion quality and buyer intent stage.",
      roadmap_90: "Scale profitable channels with standardized conversion playbooks.",
      content_format_channel_snapshot:
        "Blend social proof reels, creator stories, and comparison-focused PDP modules.",
      marketing_spend_audit_signal:
        "Reallocate spend from broad reach to high-intent retargeting and trust-led conversion assets.",
      competitive_vulnerability_signal:
        "Competitors that surface social proof earlier will continue to win checkout confidence.",
      revenue_impact_statement:
        "Reducing checkout friction and improving trust visibility can materially improve ROAS and margin.",
      brand_opportunities:
        "Unify brand expression with conversion architecture so creative strength also drives revenue efficiency.",
      full_report: {},
      user_email: "sample@wunderbar.ai",
    },
  },
  blueprint: {},
  "blueprint-plus": {},
};

/**
 * GET /api/pdf
 * 
 * Query parameters:
 * - id: Report ID (required if not using inline data)
 * - type: Document type - "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus" (default: "snapshot")
 * - upload: "1" to upload to Supabase Storage and return URL (optional)
 * 
 * Examples:
 * - /api/pdf?id=abc123&type=snapshot
 * - /api/pdf?id=abc123&type=snapshot-plus&upload=1
 * - /api/pdf?id=abc123&type=blueprint
 */
export async function GET(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "pdf", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const url = new URL(req.url);
    const reportId = url.searchParams.get("id");
    const documentType = (url.searchParams.get("type") || "snapshot") as PDFDocumentType;
    const upload = url.searchParams.get("upload") === "1";

    // Validate document type
    const validTypes: PDFDocumentType[] = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // If no report ID, return error (inline data should use POST)
    if (!reportId) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    const sampleReport = SAMPLE_REPORTS_BY_TYPE[documentType]?.[reportId];
    if (sampleReport) {
      const filename = getFilename(reportId, documentType);
      return generatePdfResponseFromReport(sampleReport, documentType, filename);
    }

    const supabase = supabaseServer();

    // Determine primary table based on document type
    const tableLookupOrder: string[] = [];
    switch (documentType) {
      case "snapshot":
        tableLookupOrder.push("brand_snapshot_reports");
        break;
      case "snapshot-plus":
        tableLookupOrder.push("brand_snapshot_plus_reports");
        break;
      case "blueprint":
        tableLookupOrder.push("brand_blueprint_results", "brand_snapshot_plus_reports");
        break;
      case "blueprint-plus":
        tableLookupOrder.push("brand_blueprint_plus_reports", "brand_snapshot_plus_reports");
        break;
      default:
        tableLookupOrder.push("brand_snapshot_reports");
    }

    // Fetch report — try primary table first, then fallback
    let report: any = null;
    for (const table of tableLookupOrder) {
      const idCol = table === "brand_blueprint_results" ? "blueprint_id" : "report_id";
      const { data, error: fetchErr } = await supabase
        .from(table as any)
        .select("*")
        .eq(idCol, reportId)
        .maybeSingle();

      if (!fetchErr && data) {
        report = data;
        break;
      }
    }

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Generate filename
    const filename = getFilename(reportId, documentType);

    // Generate PDF response
    const pdfResponse = await generatePdfResponseFromReport(
      report,
      documentType,
      filename
    );

    // If upload requested: upload to Supabase Storage and return URL
    if (upload) {
      const pdfBuffer = await pdfResponse.arrayBuffer();
      const buffer = Buffer.from(pdfBuffer);

      const bucket = process.env.REPORT_STORAGE_BUCKET || "brand-snapshot-reports";
      const fileName = `reports/${reportId}-${documentType}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        logger.error("[PDF Upload] Error", {
          error: uploadError.message,
        });
        return NextResponse.json(
          { error: "Failed to upload PDF" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;

      // Try to get signed URL as fallback
      let signedUrl: string | null = null;
      try {
        const { data: signed } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days
        signedUrl = signed?.signedUrl || null;
      } catch {
        // ignore
      }

      return NextResponse.json({
        url: publicUrl,
        signedUrl,
        filename: fileName,
      });
    }

    // Return PDF download
    return pdfResponse;
  } catch (err: any) {
    logger.error("[PDF API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pdf
 * 
 * Accepts inline data to generate PDF without database lookup
 * 
 * Body:
 * {
 *   type: "snapshot" | "snapshot-plus" | "blueprint" | "blueprint-plus",
 *   data: { ... } // Document-specific props
 *   filename?: string // Optional custom filename
 * }
 */
export async function POST(req: Request) {
  try {
    const { apiGuard } = await import("@/lib/security/apiGuard");
    const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
    const guard = apiGuard(req, { routeId: "pdf", rateLimit: GENERAL_RATE_LIMIT });
    if (!guard.passed) return guard.errorResponse;

    const body = await req.json();
    const { type, data, filename } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Missing required field: data" },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes: PDFDocumentType[] = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid document type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate PDF response
    const pdfResponse = await generatePdfResponse({
      documentType: type,
      data,
      filename: filename || getFilename("report", type),
    });

    return pdfResponse;
  } catch (err: any) {
    logger.error("[PDF API] Error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: err?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate filename based on document type
 */
function getFilename(reportId: string, documentType: PDFDocumentType): string {
  const typeNames: Record<PDFDocumentType, string> = {
    snapshot: "BrandSnapshot",
    "snapshot-plus": "SnapshotPlus",
    blueprint: "BrandBlueprint",
    "blueprint-plus": "BrandBlueprintPlus",
  };

  return `${typeNames[documentType]}_Report_${reportId}.pdf`;
}
