"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SnapshotModal from "@/components/SnapshotModal";

export default function BrandSnapshotGetStartedPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <SnapshotModal
        isOpen={open}
        onClose={() => {
          setOpen(false);
          router.push("/brand-snapshot");
        }}
      />

      {/* Background fallback if user closes immediately */}
      <main className="min-h-screen bg-white px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold text-brand-navy">
            Brand Snapshot™
          </h1>
          <p className="mt-4 text-slate-700">
            Your Brand Snapshot™ is opening in a modal. If it didn’t open,{" "}
            <button
              className="underline text-brand-navy"
              onClick={() => setOpen(true)}
            >
              click here to try again
            </button>
            .
          </p>
        </div>
      </main>
    </>
  );
}


