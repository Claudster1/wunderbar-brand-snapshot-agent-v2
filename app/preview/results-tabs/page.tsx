import { Suspense } from "react";
import PreviewResultsTabsClient from "./PreviewResultsTabsClient";

export const dynamic = "force-dynamic";

export default function PreviewResultsTabsPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen font-brand flex items-center justify-center px-4"
          style={{ backgroundColor: "#F5F5F7" }}
        >
          <p className="text-sm" style={{ color: "#86868B" }}>
            Loading preview…
          </p>
        </main>
      }
    >
      <PreviewResultsTabsClient />
    </Suspense>
  );
}
