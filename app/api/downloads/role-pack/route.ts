import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

type PackId = "leadership" | "marketing" | "sales" | "design";
type BundleItem = { name: string; url: string };

const PACK_LABELS: Record<PackId, string> = {
  leadership: "Leadership_Pack",
  marketing: "Marketing_Pack",
  sales: "Sales_Pack",
  design: "Design_Pack",
};

function normalizeTier(value: string | null): "blueprint-plus" | "other" {
  if (!value) return "other";
  return value.toLowerCase().replace(/_/g, "-") === "blueprint-plus" ? "blueprint-plus" : "other";
}

function doc(reportId: string, type: string, emailParam: string, origin: string): BundleItem {
  return {
    name: `${type}.pdf`,
    url: `${origin}/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=${encodeURIComponent(type)}&tier=blueprint-plus${emailParam}`,
  };
}

function packItems(pack: PackId, reportId: string, emailParam: string, origin: string): BundleItem[] {
  const schedule: BundleItem = {
    name: "activation_schedule.xlsx",
    url: `${origin}/api/results/activation-schedule?reportId=${encodeURIComponent(reportId)}${emailParam}`,
  };

  switch (pack) {
    case "leadership":
      return [
        doc(reportId, "executive", emailParam, origin),
        doc(reportId, "activation", emailParam, origin),
        doc(reportId, "competitive", emailParam, origin),
      ];
    case "marketing":
      return [
        doc(reportId, "messaging", emailParam, origin),
        doc(reportId, "icp-conversion-snapshot", emailParam, origin),
        doc(reportId, "icp-conversion-intelligence", emailParam, origin),
        doc(reportId, "prompts", emailParam, origin),
        doc(reportId, "digital", emailParam, origin),
        schedule,
      ];
    case "sales":
      return [
        doc(reportId, "icp-conversion-intelligence", emailParam, origin),
        doc(reportId, "competitive", emailParam, origin),
        doc(reportId, "battle-cards", emailParam, origin),
        doc(reportId, "messaging", emailParam, origin),
      ];
    case "design":
      return [
        doc(reportId, "standards", emailParam, origin),
        doc(reportId, "voice-checklist", emailParam, origin),
      ];
  }
}

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed ${url} (${response.status})`);
  }
  return response.arrayBuffer();
}

export async function GET(req: NextRequest) {
  const guard = apiGuard(req, {
    routeId: "downloads-role-pack",
    rateLimit: GENERAL_RATE_LIMIT,
  });
  if (!guard.passed) return guard.errorResponse;

  const reportId = req.nextUrl.searchParams.get("reportId");
  const email = req.nextUrl.searchParams.get("email");
  const pack = req.nextUrl.searchParams.get("pack") as PackId | null;
  const tier = req.nextUrl.searchParams.get("tier");

  if (!reportId || !pack) {
    return NextResponse.json({ error: "Missing reportId or pack" }, { status: 400 });
  }
  if (!["leadership", "marketing", "sales", "design"].includes(pack)) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }
  if (normalizeTier(tier) !== "blueprint-plus") {
    return NextResponse.json(
      { error: "Role packs are available for Blueprint+™." },
      { status: 403 },
    );
  }

  const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";
  const origin = req.nextUrl.origin;
  const items = packItems(pack, reportId, emailParam, origin);

  const zip = new JSZip();
  const errors: string[] = [];
  for (const item of items) {
    try {
      const data = await fetchBinary(item.url);
      zip.file(item.name, data);
    } catch (error) {
      errors.push(`${item.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (errors.length > 0) {
    zip.file("README.txt", `Some files could not be included:\n\n${errors.join("\n")}`);
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const filename = `${PACK_LABELS[pack]}_${reportId}.zip`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
