// app/workbook/layout.tsx
// Layout for brand workbook page — report-related, noindex

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WorkbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
