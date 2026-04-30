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
  "voice-checklist",
  "activation",
  "digital",
  "competitive",
  "battle-cards",
  "standards",
] as const;
const BLUEPRINT_DOC_TYPES = ["complete", "executive", "messaging", "prompts", "voice-checklist"] as const;
const BLUEPRINT_PLUS_ONLY_DOC_TYPES = ["activation", "digital", "competitive", "battle-cards", "standards"] as const;

const MAX_EXPIRY_DAYS = 30;
const DEFAULT_EXPIRY_DAYS = 7;

function isValidTier(value: string): value is (typeof VALID_TIERS)[number] {
  return (VALID_TIERS as readonly string[]).includes(value);
}

function isValidDocType(value: string): value is (typeof VALID_DOC_TYPES)[number] {
  return (VALID_DOC_TYPES as readonly string[]).includes(value);
}

function isDocTypeAllowedForTier(
  docType: (typeof VALID_DOC_TYPES)[number],
  tier: (typeof VALID_TIERS)[number],
): boolean {
  if (docType === "report") return true;
  if (tier === "snapshot" || tier === "snapshot-plus") return false;
  if (tier === "blueprint") {
    return (BLUEPRINT_DOC_TYPES as readonly string[]).includes(docType);
  }
  if (tier === "blueprint-plus") {
    return (
      (BLUEPRINT_DOC_TYPES as readonly string[]).includes(docType) ||
      (BLUEPRINT_PLUS_ONLY_DOC_TYPES as readonly string[]).includes(docType)
    );
  }
  return false;
}

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
    const reportTier =
      typeof tier === "string" && tier.trim().length > 0
        ? tier.trim().toLowerCase().replace(/_/g, "-")
        : "snapshot";

    if (!isValidDocType(docType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    if (!isValidTier(reportTier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!isDocTypeAllowedForTier(docType, reportTier)) {
      return NextResponse.json({ error: "Document type is not available for this tier" }, { status: 400 });
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
