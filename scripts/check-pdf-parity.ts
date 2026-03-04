import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type CheckResult = {
  ok: boolean;
  message: string;
};

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function checkFileExists(path: string): CheckResult {
  if (!existsSync(resolve(process.cwd(), path))) {
    return { ok: false, message: `Missing file: ${path}` };
  }
  return { ok: true, message: `Found: ${path}` };
}

function checkUsesCentralPipeline(path: string): CheckResult {
  const content = read(path);
  const hasImport = content.includes('from "@/src/pdf/generatePdf"');
  const hasCall = content.includes("generatePdfResponseFromReport(");

  if (!hasImport || !hasCall) {
    return {
      ok: false,
      message: `${path} must import and call generatePdfResponseFromReport`,
    };
  }
  return { ok: true, message: `${path} uses centralized PDF pipeline` };
}

function checkUnifiedPdfRoute(path: string): CheckResult {
  const content = read(path);
  const hasSnapshotType = content.includes('"snapshot"');
  const hasFromReport = content.includes("generatePdfResponseFromReport(");
  const hasTransform = content.includes("transformReportDataForPdf(");

  if (!hasSnapshotType) {
    return { ok: false, message: `${path} missing snapshot type handling` };
  }
  if (!hasFromReport && !hasTransform) {
    return {
      ok: false,
      message: `${path} must generate snapshot PDFs through centralized transformer/pipeline`,
    };
  }
  return { ok: true, message: `${path} handles snapshot through centralized path` };
}

function main() {
  const files = [
    "app/api/pdf/route.ts",
    "app/api/snapshot/pdf/route.ts",
    "app/api/reports/pdf/route.ts",
    "lib/generateSnapshotPdf.ts",
  ];

  const checks: CheckResult[] = [];
  for (const file of files) checks.push(checkFileExists(file));

  if (checks.some((c) => !c.ok)) {
    checks.forEach((c) => console.log(`${c.ok ? "✅" : "❌"} ${c.message}`));
    process.exit(1);
  }

  checks.push(checkUnifiedPdfRoute("app/api/pdf/route.ts"));
  checks.push(checkUsesCentralPipeline("app/api/snapshot/pdf/route.ts"));
  checks.push(checkUsesCentralPipeline("app/api/reports/pdf/route.ts"));
  checks.push(
    (() => {
      const content = read("lib/generateSnapshotPdf.ts");
      const ok =
        content.includes("generatePdfFromReport(") &&
        content.includes('"snapshot"') &&
        !content.includes("BrandSnapshotReport");
      return {
        ok,
        message: ok
          ? "lib/generateSnapshotPdf.ts delegates to centralized pipeline"
          : "lib/generateSnapshotPdf.ts must delegate to centralized pipeline only",
      };
    })()
  );

  const failed = checks.filter((c) => !c.ok);
  checks.forEach((c) => console.log(`${c.ok ? "✅" : "❌"} ${c.message}`));

  if (failed.length > 0) {
    console.error(`\nPDF parity check failed (${failed.length} issue(s)).`);
    process.exit(1);
  }

  console.log("\nPDF parity check passed.");
  console.log("PASS PDF parity checks");
}

main();
