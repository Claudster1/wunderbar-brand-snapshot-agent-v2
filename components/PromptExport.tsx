// components/PromptExport.tsx
// Component for exporting prompts (copy and download)

"use client";

import { useState } from "react";

type PromptExportProps = {
  prompt: string;
  filename: string;
};

export function PromptExport({ prompt, filename }: PromptExportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3 mt-4">
      <button onClick={handleCopy} className="btn-secondary">
        {copied ? "Copied" : "Copy Prompt"}
      </button>
      <button onClick={handleDownload} className="btn-secondary">
        Download
      </button>
    </div>
  );
}
