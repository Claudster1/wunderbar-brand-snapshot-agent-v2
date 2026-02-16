// app/snapshot-plus/[id]/layout.tsx
// Layout for Snapshot+ report pages — noindex

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SnapshotPlusReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
