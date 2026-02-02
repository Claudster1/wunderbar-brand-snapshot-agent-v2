// app/report/[id]/layout.tsx
// Layout with metadata for Brand Snapshot report pages

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Use NEXT_PUBLIC_BASE_URL if set, otherwise try Vercel's automatic URL, then fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";

  return {
    title: "Your Brand Snapshot™ Results",
    description: "Personalized brand clarity powered by WUNDY™.",
    openGraph: {
      title: "Your Brand Snapshot™ Results",
      description: "Personalized brand clarity powered by WUNDY™.",
      images: [
        {
          // Use the report-specific OG route (uses report_id)
          url: `${baseUrl}/api/og/${id}`,
          width: 1200,
          height: 630,
          alt: "Brand Snapshot™ Results",
        },
      ],
    },
  };
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

