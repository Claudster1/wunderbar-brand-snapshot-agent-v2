"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const NAVY = "#021859";
const BLUE = "#07B0F2";
const WHITE = "#FFFFFF";
const LIGHT_BG = "#F4F7FB";
const BORDER = "#D6DFE8";
const SUB = "#5A6B7E";

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const errorCode = search.get("error");
  const errorCopy = useMemo(() => {
    if (errorCode === "forbidden") {
      return "Your account is authenticated but not an admin. Ask to be added to admin_users.";
    }
    if (errorCode === "otp_expired") {
      return "That magic link is invalid or expired. Request a fresh link and try again.";
    }
    if (errorCode === "missing_code") {
      return "Sign-in callback was incomplete. Request a fresh magic link.";
    }
    if (errorCode === "config") {
      return "Admin auth is not configured correctly yet. Contact support.";
    }
    return null;
  }, [errorCode]);

  useEffect(() => {
    const run = async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/admin/inbound");
    };
    void run();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent("/admin/inbound")}`
          : undefined;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: redirectTo },
      });
      if (signInError) throw signInError;
      setMessage("Magic link sent. Open your email and continue to admin.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start sign-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: LIGHT_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Lato', system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 420,
          maxWidth: "100%",
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: 28,
        }}
      >
        <h1 style={{ margin: 0, color: NAVY, fontSize: 22 }}>Admin Sign In</h1>
        <p style={{ margin: "8px 0 16px", color: SUB, fontSize: 13 }}>
          Use your admin email to receive a secure magic link.
        </p>

        {errorCopy && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              fontSize: 12,
            }}
          >
            {errorCopy}
          </div>
        )}
        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#FEF2F2",
              color: "#991B1B",
              border: "1px solid #FECACA",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#ECFEFF",
              color: "#155E75",
              border: "1px solid #A5F3FC",
              fontSize: 12,
            }}
          >
            {message}
          </div>
        )}

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            marginBottom: 10,
          }}
        />
        <button
          type="submit"
          disabled={!email.trim() || loading}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: BLUE,
            color: WHITE,
            fontWeight: 700,
            cursor: "pointer",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}
