// lib/supabase/server.ts
// Server-only Supabase client (service role). Do NOT import from client components.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

export function supabaseServer() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

