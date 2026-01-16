// components/ui/RefinementModal.tsx
// Modal for requesting pillar refinements

"use client";

import { useState } from "react";
import ModalShell from "./ModalShell";
import { PillarKey } from "@/lib/pillars/pillarCopy";

interface RefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillar: PillarKey;
  reportId: string;
}

export function RefinementModal({
  isOpen,
  onClose,
  pillar,
  reportId,
}: RefinementModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/refinements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          pillar,
          note,
          status: "open",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit refinement request");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setNote("");
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pillarLabels: Record<PillarKey, string> = {
    positioning: "Positioning",
    messaging: "Messaging",
    visibility: "Visibility",
    credibility: "Credibility",
    conversion: "Conversion",
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} width="max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold text-brand-navy mb-2">
          Request Refinement: {pillarLabels[pillar]}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Share additional context or ask for clarification on this pillar. We'll
          review your request and provide an updated analysis.
        </p>

        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Refinement request submitted successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="note"
                className="block text-sm font-medium text-brand-navy mb-2"
              >
                Additional Context or Request
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none resize-none"
                placeholder="Share any additional context, ask questions, or request specific clarifications about this pillar..."
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !note.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blueHover transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalShell>
  );
}
