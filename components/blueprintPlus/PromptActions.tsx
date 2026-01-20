"use client";

export function PromptActions({ content }: { content: string }) {
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(content);
    alert("Prompt copied");
  };

  const downloadPrompt = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blueprint-plus-prompt.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 flex gap-4">
      <button
        onClick={copyPrompt}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        Copy prompt
      </button>

      <button
        onClick={downloadPrompt}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        Download
      </button>
    </div>
  );
}
