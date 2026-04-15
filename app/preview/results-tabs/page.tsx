import PreviewResultsTabsClient from "./PreviewResultsTabsClient";
import { parseActivationPlanSectionId, parseResultsTabId } from "@/components/results/tabConfig";
import { isWorkbookSectionId, type WorkbookSectionId } from "@/lib/workbookTypes";

export const dynamic = "force-dynamic";

function firstQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return undefined;
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PreviewResultsTabsPage({ searchParams }: PageProps) {
  const sp = searchParams != null ? await searchParams : {};
  const initialActiveTab = parseResultsTabId(firstQueryString(sp.tab));
  const initialActivationPlanId = parseActivationPlanSectionId(
    firstQueryString(sp.activationPlanId),
  );
  const workbookSectionRaw = firstQueryString(sp.workbookSection);
  const initialWorkbookSectionId: WorkbookSectionId | undefined =
    isWorkbookSectionId(workbookSectionRaw) ? workbookSectionRaw : undefined;
  const activationFocus = firstQueryString(sp.activationFocus) ?? null;

  return (
    <PreviewResultsTabsClient
      initialActiveTab={initialActiveTab}
      initialActivationPlanId={initialActivationPlanId}
      initialWorkbookSectionId={initialWorkbookSectionId}
      activationFocus={activationFocus}
    />
  );
}
