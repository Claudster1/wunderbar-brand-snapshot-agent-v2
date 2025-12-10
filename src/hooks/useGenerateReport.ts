import { useState } from "react";

export function useGenerateReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport(reportData: any) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/generateReport", {
        method: "POST",
        body: JSON.stringify(reportData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to generate report");
      }

      const json = await res.json();

      return {
        reportId: json.reportId,
        pdfUrl: json.pdfUrl,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { generateReport, loading, error };
}

