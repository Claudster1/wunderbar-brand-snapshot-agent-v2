import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabaseAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase public auth env vars");
  }
  return { url, anonKey };
}

function getSafeNextPath(nextParam: string | null): string {
  if (!nextParam) return "/admin/inbound";
  // Allow only internal admin routes to prevent open redirects.
  if (nextParam.startsWith("/admin")) return nextParam;
  return "/admin/inbound";
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextPath = getSafeNextPath(requestUrl.searchParams.get("next"));

  const loginUrl = new URL("/admin-login", requestUrl.origin);
  const successUrl = new URL(nextPath, requestUrl.origin);
  const response = NextResponse.redirect(successUrl);

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseAuthConfig());
  } catch {
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
    loginUrl.searchParams.set("error", "otp_expired");
    return NextResponse.redirect(loginUrl);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) return response;
    loginUrl.searchParams.set("error", "otp_expired");
    return NextResponse.redirect(loginUrl);
  }

  loginUrl.searchParams.set("error", "missing_code");
  return NextResponse.redirect(loginUrl);
}
