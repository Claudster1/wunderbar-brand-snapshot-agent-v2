import { supabaseServer } from "@/lib/supabase";

export async function loadBlueprintEnrichment(reportId: string) {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("blueprint_enrichment")
    .select("data")
    .eq("report_id", reportId)
    .single();

  const row = data as { data?: unknown } | null;
  return row?.data ?? null;
}
