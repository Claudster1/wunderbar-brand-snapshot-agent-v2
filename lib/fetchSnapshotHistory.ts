import { supabase } from "@/lib/supabase";

export async function fetchSnapshotHistory(email: string) {
  const { data, error } = await supabase
    .from("brand_snapshots")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
