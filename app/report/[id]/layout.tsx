// app/report/[id]/layout.tsx
// Layout with metadata for Brand Snapshot report pages

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    title: "Your Brand Snapshot™ Results",
    description: "Personalized brand clarity powered by WUNDY™.",
    openGraph: {
      title: "Your Brand Snapshot™ Results",
      description: "Personalized brand clarity powered by WUNDY™.",
      images: [
        {
          // Use the report-specific OG route (uses report_id)
          url: `${baseUrl}/api/og/${params.id}`,
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

