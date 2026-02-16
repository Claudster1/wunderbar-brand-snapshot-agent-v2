// app/refine/layout.tsx
// Layout for refinement chat page — report-related, noindex

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RefineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
