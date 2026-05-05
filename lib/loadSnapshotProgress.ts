// lib/loadSnapshotProgress.ts
// Function to load snapshot progress from database

import { findBrandSnapshotReportByPublicId } from "@/lib/brandSnapshotReportLookup";

export async function loadSnapshotProgress(reportId: string) {
  const row = await findBrandSnapshotReportByPublicId(reportId);
  if (!row) return null;
  return {
    last_step: (row as { last_step?: string }).last_step,
    progress: (row as { progress?: unknown }).progress,
  };
}
