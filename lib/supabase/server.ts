// lib/supabase/server.ts
// Server-only Supabase client (service role). Do NOT import from client components.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "[supabaseServer] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your environment variables."
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
