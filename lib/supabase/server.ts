// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/supabase/types";

export function supabaseServer() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return undefined; // no cookies needed for backend calls
        },
      },
    }
  );
}

