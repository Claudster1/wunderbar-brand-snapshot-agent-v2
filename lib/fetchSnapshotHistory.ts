import { supabaseServer } from "@/lib/supabase";

export async function fetchSnapshotHistory(email: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("brand_snapshot_reports")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
