import { notFound } from "next/navigation";
import ActivationPlanStandaloneClient from "@/app/results/activation/[planId]/ActivationPlanStandaloneClient";
import { buildActivationPlanSectionsList } from "@/lib/activation/activationPlanModel";
import {
  ACTIVATION_PLAN_SECTION_IDS,
  filterActivationPlanSections,
  type ActivationPlanSectionId,
} from "@/components/results/tabConfig";
import {
  previewActivationContent,
  previewActivationScheduleRows,
  previewActivationStrategicPriorities,
  previewAudiencePersonaDefinition,
  previewIcpConversionIntelligenceFramework,
  previewPaidMediaStrategy,
  previewPersonaDrivenSegmentation,
} from "@/app/preview/results-tabs/previewActivationMockData";

const previewDiagnosticData: Record<string, unknown> = {
  companyName: "Acme Co",
  businessName: "Acme Co",
  reportId: "preview-results-tabs",
  userEmail: "preview@wunderbar.ai",
  resultsDeliveredAt: "2026-03-05T17:30:00.000Z",
  industry: "B2B Services",
  targetAudience: "Founder-led and growth-stage service businesses",
  primaryArchetype: "The Sage",
  secondaryArchetype: "The Explorer",
  productTier: "blueprint-plus",
  hasPriorityActions: true,
  primaryPillar: "Visibility",
  strategicPriorities: previewActivationStrategicPriorities,
  scheduleRows: previewActivationScheduleRows,
  paidMediaStrategy: previewPaidMediaStrategy,
  icpConversionIntelligenceFramework: previewIcpConversionIntelligenceFramework,
  personaDrivenSegmentation: previewPersonaDrivenSegmentation,
  audiencePersonaDefinition: previewAudiencePersonaDefinition,
  ...previewActivationContent,
};

function isActivationPlanSectionId(id: string): id is ActivationPlanSectionId {
  return (ACTIVATION_PLAN_SECTION_IDS as readonly string[]).includes(id);
}

type PageProps = {
  params: Promise<{ planId: string }>;
};

export default async function PreviewActivationPlanPage({ params }: PageProps) {
  const { planId } = await params;
  if (!isActivationPlanSectionId(planId)) notFound();

  const allSections = buildActivationPlanSectionsList(previewDiagnosticData, previewActivationScheduleRows.length);
  const visibleSections = filterActivationPlanSections("blueprint-plus", allSections);
  const section = visibleSections.find((s) => s.id === planId);
  if (!section) notFound();

  return (
    <main className="min-h-screen font-brand" style={{ backgroundColor: "#F5F7FA" }}>
      <ActivationPlanStandaloneClient
        section={section}
        productTier="blueprint-plus"
        diagnosticData={previewDiagnosticData}
        scheduleRows={previewActivationScheduleRows}
        reportId="preview-results-tabs"
        scheduleExportHref={null}
        workbookHref={`/preview/results-tabs?tab=workbook&workbookSection=${encodeURIComponent(
          section.workbookSectionId,
        )}&activationPlanId=${encodeURIComponent(section.id)}`}
      />
    </main>
  );
}
