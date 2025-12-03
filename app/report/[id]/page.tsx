// app/report/[id]/page.tsx

import { ReportTemplate } from "@/components/ReportTemplate";
import { notFound } from "next/navigation";

// TODO: Replace with your real DB fetch (Supabase, Neon, etc.)
async function getReportData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  const response = await fetch(
    `${baseUrl}/api/report/get?id=${id}`,
    { cache: "no-store" }
  );

  if (!response.ok) return null;

  return response.json();
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const report = await getReportData(params.id);

  if (!report) return notFound();

  return (
    <main className="bg-white min-h-screen">
      <ReportTemplate data={report} />
    </main>
  );
}

