import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { apiGuard } from "@/lib/security/apiGuard";
import { GENERAL_RATE_LIMIT } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

type BundleItem = {
  name: string;
  url: string;
};

function normalizeTier(value: string | null): "blueprint-plus" | "other" {
  if (!value) return "other";
  return value.toLowerCase().replace(/_/g, "-") === "blueprint-plus" ? "blueprint-plus" : "other";
}

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed ${url} (${response.status})`);
  }
  return response.arrayBuffer();
}

function blueprintDoc(
  origin: string,
  reportId: string,
  type: string,
  emailParam: string,
  filename: string,
): BundleItem {
  return {
    name: filename,
    url: `${origin}/api/blueprint/pdf?reportId=${encodeURIComponent(reportId)}&type=${encodeURIComponent(type)}&tier=blueprint-plus${emailParam}`,
  };
}

function rolePackZip(
  origin: string,
  reportId: string,
  pack: "leadership" | "marketing" | "sales" | "design",
  emailParam: string,
  filename: string,
): BundleItem {
  return {
    name: filename,
    url: `${origin}/api/downloads/role-pack?reportId=${encodeURIComponent(reportId)}&pack=${encodeURIComponent(pack)}&tier=blueprint-plus${emailParam}`,
  };
}

export async function GET(req: NextRequest) {
  const guard = apiGuard(req, {
    routeId: "downloads-bundle",
    rateLimit: GENERAL_RATE_LIMIT,
  });
  if (!guard.passed) return guard.errorResponse;

  const reportId = req.nextUrl.searchParams.get("reportId");
  const email = req.nextUrl.searchParams.get("email");
  const tier = req.nextUrl.searchParams.get("tier");

  if (!reportId) {
    return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
  }
  if (normalizeTier(tier) !== "blueprint-plus") {
    return NextResponse.json(
      { error: "Bundle download is available for Blueprint+™." },
      { status: 403 },
    );
  }

  const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";
  const origin = req.nextUrl.origin;

  const items: BundleItem[] = [
    blueprintDoc(origin, reportId, "complete", emailParam, "01_Brand_Playbook_Full_Report.pdf"),
    blueprintDoc(origin, reportId, "executive", emailParam, "02_Executive_Summary.pdf"),
    blueprintDoc(origin, reportId, "messaging", emailParam, "03_Brand_Strategy.pdf"),
    blueprintDoc(origin, reportId, "messaging", emailParam, "04_One_Page_Messaging.pdf"),
    blueprintDoc(origin, reportId, "prompts", emailParam, "05_Prompt_Guide.pdf"),
    blueprintDoc(origin, reportId, "voice-checklist", emailParam, "06_Voice_Checklist.pdf"),
    blueprintDoc(origin, reportId, "icp-conversion-snapshot", emailParam, "07_ICP_Conversion_Snapshot.pdf"),
    blueprintDoc(
      origin,
      reportId,
      "icp-conversion-intelligence",
      emailParam,
      "08_ICP_Conversion_Intelligence_Framework.pdf",
    ),
    blueprintDoc(origin, reportId, "activation", emailParam, "09_Activation_Plan.pdf"),
    blueprintDoc(origin, reportId, "activation", emailParam, "10_Strategic_Action_Plan.pdf"),
    blueprintDoc(origin, reportId, "digital", emailParam, "11_Digital_Marketing_Strategy.pdf"),
    blueprintDoc(origin, reportId, "competitive", emailParam, "12_Competitive_Intelligence_Brief.pdf"),
    blueprintDoc(origin, reportId, "battle-cards", emailParam, "13_Sales_Battle_Cards.pdf"),
    blueprintDoc(origin, reportId, "standards-internal", emailParam, "14_Internal_Brand_Master_Guide.pdf"),
    blueprintDoc(origin, reportId, "standards-external", emailParam, "15_External_Brand_Guide.pdf"),
    blueprintDoc(origin, reportId, "standards-vendor", emailParam, "16_Partner_Vendor_Spec_Sheet.pdf"),
    {
      name: "17_Activation_Schedule.xlsx",
      url: `${origin}/api/results/activation-schedule?reportId=${encodeURIComponent(reportId)}${emailParam}`,
    },
    rolePackZip(origin, reportId, "leadership", emailParam, "18_Role_Pack_Leadership.zip"),
    rolePackZip(origin, reportId, "marketing", emailParam, "19_Role_Pack_Marketing.zip"),
    rolePackZip(origin, reportId, "sales", emailParam, "20_Role_Pack_Sales.zip"),
    rolePackZip(origin, reportId, "design", emailParam, "21_Role_Pack_Design.zip"),
  ];

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
  const filename = `wunderbrand_blueprint_plus_bundle_${reportId}.zip`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
