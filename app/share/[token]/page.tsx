import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

type SharedLink = {
  id: string;
  token: string;
  report_id: string;
  document_type: string;
  tier: string;
  created_by: string;
  expires_at: string;
  access_count: number;
  max_access_count: number | null;
  is_revoked: boolean;
  label: string | null;
};

function buildPdfUrl(link: SharedLink): string {
  const { report_id, document_type, tier } = link;
  const encodedId = encodeURIComponent(report_id);

  if (document_type === "report") {
    const apiTier = tier.replace("_", "-");
    return `/api/pdf?id=${encodedId}&type=${apiTier}`;
  }

  const apiTier = tier === "blueprint_plus" || tier === "blueprint-plus" ? "blueprint-plus" : "blueprint";
  return `/api/blueprint/pdf?reportId=${encodedId}&type=${document_type}&tier=${apiTier}`;
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 10) {
    return <ExpiredPage reason="Invalid share link." />;
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("shared_links" as any)
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return <ExpiredPage reason="This share link was not found." />;
  }

  const link = data as unknown as SharedLink;

  if (link.is_revoked) {
    return <ExpiredPage reason="This share link has been revoked by the owner." />;
  }

  if (new Date(link.expires_at) < new Date()) {
    return <ExpiredPage reason="This share link has expired." />;
  }

  if (link.max_access_count && link.access_count >= link.max_access_count) {
    return <ExpiredPage reason="This share link has reached its maximum number of views." />;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("shared_links" as any) as any).update({ access_count: link.access_count + 1 }).eq("id", link.id);

  const pdfUrl = buildPdfUrl(link);

  redirect(pdfUrl);
}

function ExpiredPage({ reason }: { reason: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "'Lato', system-ui, sans-serif",
        background: "#F5F7FB",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          background: "#fff",
          borderRadius: 12,
          padding: "48px 32px",
          border: "1px solid #E0E3EA",
          boxShadow: "0 8px 24px rgba(2,24,89,0.06)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#FEE2E2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
            <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" />
            <path d="M15 9l-6 6M9 9l6 6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#021859",
            margin: "0 0 12px",
          }}
        >
          Link unavailable
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#5A6B7E",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}
        >
          {reason}
        </p>
        <a
          href="/brand-snapshot"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 24px",
            borderRadius: 6,
            background: "#07B0F2",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Get your own WunderBrand Score™
        </a>
      </div>
    </main>
  );
}
