import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { safeFetchJson } from "@/lib/resilience/safeFetch";
import { snapshotReportToActivationWorkspace } from "@/lib/activation/snapshotReportToActivationWorkspace";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import {
  ACTIVATION_PLAN_SECTION_IDS,
  filterActivationPlanSections,
  type ActivationPlanSectionId,
} from "@/components/results/tabConfig";
import ActivationPlanStandaloneClient from "./ActivationPlanStandaloneClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function resolveBaseUrlFromHeaders() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  if (!host) return null;
  const proto = hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function resolveRuntimeBaseUrl() {
  const requestBaseUrl = await resolveBaseUrlFromHeaders();
  if (process.env.NODE_ENV !== "production") {
    return requestBaseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    requestBaseUrl ||
    "http://localhost:3000"
  );
}

function isActivationPlanSectionId(id: string): id is ActivationPlanSectionId {
  return (ACTIVATION_PLAN_SECTION_IDS as readonly string[]).includes(id);
}

function firstQueryString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

type PageProps = {
  params: Promise<{ planId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ActivationPlanPage({ params, searchParams }: PageProps) {
  const { planId: rawPlanId } = await params;
  const planId = decodeURIComponent(rawPlanId);

  if (!isActivationPlanSectionId(planId)) {
    notFound();
  }

  const resolved = searchParams != null ? await searchParams : {};
  const reportId = firstQueryString(resolved.reportId) ?? firstQueryString(resolved.id);
  const emailFromQuery = firstQueryString(resolved.email);
  const workbookVersionId = firstQueryString(resolved.versionId);

  if (!reportId) {
    return (
      <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#021859", margin: "0 0 12px" }}>Missing report</h1>
          <p style={{ fontSize: 15, color: "#5A6B7E", lineHeight: 1.55, margin: "0 0 20px" }}>
            Add <code style={{ fontSize: 13 }}>reportId</code> to the URL to open this activation plan (same id as your results
            link).
          </p>
          <Link href="/brand-snapshot" style={{ color: "#0D5BD7", fontWeight: 700 }}>
            Start WunderBrand Snapshot™
          </Link>
        </div>
      </main>
    );
  }

  if (reportId.startsWith("preview-")) {
    return (
      <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#021859", margin: "0 0 12px" }}>Preview mode</h1>
          <p style={{ fontSize: 15, color: "#5A6B7E", lineHeight: 1.55 }}>
            Open this plan from the full results suite or use a real report id.
          </p>
        </div>
      </main>
    );
  }

  const baseUrl = await resolveRuntimeBaseUrl();
  const reportResponse = await safeFetchJson<unknown>(
    `${baseUrl}/api/snapshot/get?id=${encodeURIComponent(reportId)}`,
    { cache: "no-store", retries: 2, timeoutMs: 7000 },
  );

  if (!reportResponse.ok || !reportResponse.data) {
    notFound();
  }

  const workspace = snapshotReportToActivationWorkspace(reportResponse.data, reportId);
  if (!workspace) {
    notFound();
  }

  const { diagnosticData, scheduleRows, productTier } = workspace;
  const userEmail =
    emailFromQuery ||
    (typeof diagnosticData.userEmail === "string" ? diagnosticData.userEmail : "") ||
    (typeof (reportResponse.data as Record<string, unknown>).user_email === "string"
      ? ((reportResponse.data as Record<string, unknown>).user_email as string)
      : "");

  const allSections = buildActivationPlanSectionsList(diagnosticData, scheduleRows.length);
  const tierSections = filterActivationPlanSections(productTier, allSections);
  const section = tierSections.find((s) => s.id === planId);

  if (!section) {
    const tierLabel =
      productTier === "snapshot"
        ? "Snapshot+"
        : productTier === "snapshot-plus"
          ? "Blueprint"
          : "your current tier";
    return (
      <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#021859", margin: "0 0 12px" }}>Plan not included</h1>
          <p style={{ fontSize: 15, color: "#5A6B7E", lineHeight: 1.55, margin: "0 0 16px" }}>
            This channel plan is not part of your deliverables on the current product tier. Upgrade to {tierLabel} to unlock
            it, or open a report that includes the full Activation pack.
          </p>
          <Link
            href={`/results?reportId=${encodeURIComponent(reportId)}&tab=activation`}
            style={{ color: "#0D5BD7", fontWeight: 700 }}
          >
            Back to Activation
          </Link>
        </div>
      </main>
    );
  }

  const emailParam = userEmail ? `&email=${encodeURIComponent(userEmail)}` : "";
  const scheduleExportHref = `/api/results/activation-schedule?reportId=${encodeURIComponent(reportId)}${emailParam}`;

  return (
    <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
      <ActivationPlanStandaloneClient
        section={section}
        productTier={productTier}
        diagnosticData={diagnosticData}
        scheduleRows={scheduleRows}
        reportId={typeof diagnosticData.reportId === "string" ? diagnosticData.reportId : reportId}
        scheduleExportHref={planId === "execution-roadmap" ? scheduleExportHref : null}
        userEmail={userEmail || undefined}
        workbookVersionId={workbookVersionId}
      />
    </main>
  );
}
