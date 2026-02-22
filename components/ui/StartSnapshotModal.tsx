"use client";

import { useRouter } from "next/navigation";
import ModalShell from "./ModalShell";

interface StartSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartSnapshotModal({ isOpen, onClose }: StartSnapshotModalProps) {
  const router = useRouter();

  function beginSnapshot() {
    onClose();
    router.push("/brand-snapshot/get-started");
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-2xl">
      <div className="flex flex-col gap-6">
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-semibold text-brand-navy">
            Your WunderBrand Snapshot™ Starts Here
          </h2>
          <p className="text-[15px] leading-relaxed text-brand-midnight mt-2">
            In a focused, guided conversation, your strategic brand companion will help you uncover
            how clearly and confidently your brand is showing up in the market today.
            <br />
            <br />
            You’ll receive your WunderBrand Score™ along with a clear picture of what's working,
            what’s unclear, and where smarter refinements can create a measurable lift in trust,
            clarity, and conversion.
          </p>
        </div>

        {/* VALUE LIST */}
        <div className="bg-brand-gray/60 rounded-lg p-4 border border-brand-border">
          <ul className="list-disc pl-5 space-y-1 text-[15px] text-brand-midnight">
            <li>5-pillar brand clarity analysis</li>
            <li>WunderBrand Score™ (your overall market-readiness rating)</li>
            <li>Instant insights once completed</li>
            <li>No email required until you're ready to unlock your full report</li>
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={beginSnapshot}
          className="
            bg-brand-blue hover:bg-brand-blueHover text-white 
            font-semibold rounded-md px-6 py-3 w-full
            shadow-md shadow-brand-blue/30 transition
          "
        >
          Begin WunderBrand Snapshot™ →
        </button>

        {/* SUBTEXT */}
        <p className="text-[13px] text-slate-500 text-center">
          Estimated time: 15–20 minutes
        </p>
      </div>
    </ModalShell>
  );
}


