// components/blueprint/PromptExportControls.tsx
// Export controls for prompt packs (PDF download and copy all)

"use client";

interface PromptExportControlsProps {
  onDownloadPDF?: () => void;
  onCopyAll?: () => void;
}

export function PromptExportControls({
  onDownloadPDF,
  onCopyAll,
}: PromptExportControlsProps) {
  return (
    <div className="mt-12 flex gap-4">
      <button
        onClick={onDownloadPDF}
        className="px-5 py-2 bg-brand-blue text-white rounded-md text-sm shadow hover:bg-brand-blueHover transition"
      >
        Download Prompt Pack (PDF)
      </button>

      <button
        onClick={onCopyAll}
        className="px-5 py-2 border border-brand-border rounded-md text-sm hover:bg-slate-50 transition"
      >
        Copy All Prompts
      </button>
    </div>
  );
}
