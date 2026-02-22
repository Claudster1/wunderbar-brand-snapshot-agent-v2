import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const VALID_TIERS = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"] as const;
const VALID_DOC_TYPES = [
  "report",
  "complete",
  "executive",
  "messaging",
  "prompts",
  "activation",
  "digital",
  "competitive",
  "standards",
] as const;

const MAX_EXPIRY_DAYS = 30;
const DEFAULT_EXPIRY_DAYS = 7;

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const { GENERAL_RATE_LIMIT } = await import("@/lib/security/rateLimit");
  const guard = apiGuard(req, { routeId: "share-create", rateLimit: GENERAL_RATE_LIMIT });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const { reportId, documentType, tier, email, expiryDays, label } = body;

    if (!reportId || !email) {
      return NextResponse.json({ error: "Missing reportId or email" }, { status: 400 });
    }

    const docType = documentType || "report";
    const reportTier = tier || "snapshot";

    if (!VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    if (!VALID_TIERS.includes(reportTier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const days = Math.min(Math.max(expiryDays || DEFAULT_EXPIRY_DAYS, 1), MAX_EXPIRY_DAYS);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const token = randomBytes(24).toString("base64url");

    const supabase = supabaseServer();

    const { data, error } = await (supabase
      .from("shared_links" as any)
      .insert({
        token,
        report_id: reportId,
        document_type: docType,
        tier: reportTier,
        created_by: email.toLowerCase(),
        expires_at: expiresAt,
        label: label || null,
      } as any)
      .select("id, token, expires_at")
      .single());

    if (error) {
      const { logger } = await import("@/lib/logger");
      logger.error("[Share Create] DB error", { error: error.message });
      return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.wunderbrand.ai";
    const shareUrl = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      shareUrl,
      token,
      expiresAt: (data as any).expires_at,
      expiryDays: days,
    });
  } catch (err) {
    const { logger } = await import("@/lib/logger");
    logger.error("[Share Create] Error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
