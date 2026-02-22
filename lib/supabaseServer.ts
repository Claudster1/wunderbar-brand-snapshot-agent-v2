// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    throw new Error(
      "[supabaseServer] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your environment variables."
    );
  }

  return createClient(url, service, {
    auth: { persistSession: false },
  });
}
