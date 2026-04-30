import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { generatePdfResponse, type PDFDocumentType } from "@/src/pdf/generatePdf";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { apiGuard } = await import("@/lib/security/apiGuard");
  const guard = apiGuard(req, { routeId: "report-pdf", maxBodySize: 500_000 });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = await req.json();
    const requestedType = typeof body?.type === "string" ? body.type : undefined;
    const validTypes: PDFDocumentType[] = ["snapshot", "snapshot-plus", "blueprint", "blueprint-plus"];
    const documentType: PDFDocumentType =
      requestedType && validTypes.includes(requestedType as PDFDocumentType)
        ? (requestedType as PDFDocumentType)
        : "snapshot-plus";

    const payload = body?.data ?? body;
    return generatePdfResponse({
      documentType,
      data: payload,
      filename: `${documentType}.pdf`,
    });
  } catch (err: unknown) {
    logger.error("[/api/report] PDF generation failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "PDF generation failed. Please try again." },
      { status: 500 }
    );
  }
}
