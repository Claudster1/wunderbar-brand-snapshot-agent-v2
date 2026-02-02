import { supabaseServer } from "@/lib/supabase";
import { BlueprintEnrichmentInput } from "@/lib/enrichment/types";

export async function saveBlueprintEnrichment(
  reportId: string,
  data: BlueprintEnrichmentInput
) {
  const supabase = supabaseServer();

  await (supabase.from("blueprint_enrichment") as any).upsert({
    report_id: reportId,
    data,
    updated_at: new Date().toISOString(),
  });
}
