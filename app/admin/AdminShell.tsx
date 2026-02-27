"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const NAVY = "#021859";
const WHITE = "#FFFFFF";
const SUB = "#8BA3CF";
const BLUE = "#07B0F2";

type AdminShellProps = {
  children: React.ReactNode;
  adminEmail: string | null;
};

const NAV_ITEMS = [
  { href: "/admin/inbound", label: "Inbound" },
  { href: "/admin/unified", label: "Unified" },
  { href: "/admin/followups", label: "Follow-ups" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/experience-scores", label: "Experience" },
];

export default function AdminShell({ children, adminEmail }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const activeHref = useMemo(() => {
    return NAV_ITEMS.find((item) => pathname?.startsWith(item.href))?.href ?? null;
  }, [pathname]);

  return (
    <div style={{ minHeight: "100vh", background: "#F4F7FB", fontFamily: "'Lato', system-ui, sans-serif" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background:
            "linear-gradient(120deg, rgba(2,24,89,0.98) 0%, rgba(6,43,124,0.96) 55%, rgba(7,176,242,0.9) 140%)",
          borderBottom: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 10px 30px rgba(2,24,89,0.22)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Link
              href="/admin"
              style={{
                color: WHITE,
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.03em",
                marginRight: 6,
              }}
            >
              ADMIN
            </Link>
            {NAV_ITEMS.map((item) => {
              const active = activeHref === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: active ? WHITE : SUB,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: active ? 700 : 600,
                    background: active ? "rgba(255,255,255,0.16)" : "transparent",
                    border: active
                      ? "1px solid rgba(255,255,255,0.32)"
                      : "1px solid transparent",
                    borderRadius: 999,
                    padding: "6px 10px",
                    transition: "all 150ms ease",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {adminEmail && (
              <span style={{ color: SUB, fontSize: 11, whiteSpace: "nowrap" }}>{adminEmail}</span>
            )}
            <button
              onClick={async () => {
                if (signingOut) return;
                setSigningOut(true);
                try {
                  await supabaseBrowser().auth.signOut();
                } finally {
                  router.replace("/admin-login");
                }
              }}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 700,
                background: BLUE,
                color: NAVY,
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
              }}
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
