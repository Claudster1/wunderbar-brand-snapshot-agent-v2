import { Suspense } from "react";
import BlueprintPreviewClient from "./BlueprintPreviewClient";

export const dynamic = "force-dynamic";

export default function PreviewBlueprintPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F4F7FB" }}>
          <p className="text-sm" style={{ color: "#5A6B7E" }}>
            Loading Blueprint preview…
          </p>
        </main>
      }
    >
      <BlueprintPreviewClient />
    </Suspense>
  );
}
