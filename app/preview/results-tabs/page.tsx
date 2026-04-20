import PreviewResultsTabsClient from "./PreviewResultsTabsClient";
import { parseActivationPlanSectionId, parseResultsTabId } from "@/components/results/tabConfig";
import { isWorkbookSectionId, type WorkbookSectionId } from "@/lib/workbookTypes";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function firstQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return undefined;
}

/** Rebuild query string so we can add `tab=strategy` while keeping workbook / activation deep links. */
function toUrlSearchParams(sp: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(sp)) {
    if (raw === undefined) continue;
    if (typeof raw === "string") {
      if (raw.length > 0) params.set(key, raw);
      continue;
    }
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (typeof item === "string" && item.length > 0) params.append(key, item);
      }
    }
  }
  return params;
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PreviewResultsTabsPage({ searchParams }: PageProps) {
  const sp = searchParams != null ? await searchParams : {};
  const tabQuery = firstQueryString(sp.tab);
  const tabUnset = tabQuery === undefined || tabQuery.trim() === "";
  if (tabUnset) {
    const params = toUrlSearchParams(sp);
    params.set("tab", "strategy");
    redirect(`/preview/results-tabs?${params.toString()}`);
  }
  const initialActiveTab = parseResultsTabId(sp.tab);
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
