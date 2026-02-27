import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type AdminIdentity = {
  id: string;
  email: string | null;
};

function getSupabaseAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase publishable/anon key",
    );
  }
  return { url, anonKey };
}

async function isAdminUser(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return !!data?.user_id;
}

export async function requireAdminPage(): Promise<AdminIdentity> {
  const { url, anonKey } = getSupabaseAuthConfig();
  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          cookieStore.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin-login");

  const isAdmin = await isAdminUser(user.id);
  if (!isAdmin) redirect("/admin-login?error=forbidden");

  return { id: user.id, email: user.email ?? null };
}

export async function requireAdminApi(
  req: NextRequest,
): Promise<{ ok: true; identity: AdminIdentity } | { ok: false; response: NextResponse }> {
  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseAuthConfig());
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Supabase auth env not configured" },
        { status: 500 },
      ),
    };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll() {
        // No-op in route handlers for this auth check.
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const isAdmin = await isAdminUser(user.id);
  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, identity: { id: user.id, email: user.email ?? null } };
}
