// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/supabase/types";

export function supabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Prefer the new publishable key if provided; fallback to anon key for compatibility.
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Backward-compat alias (older code may still import supabaseClient())
export function supabaseClient() {
  return supabaseBrowser();
}

