// src/utils/prompts/copy.ts
// Utility functions for copying and downloading prompts

/**
 * Copy text to clipboard
 * @param text - The text to copy to clipboard
 */
export function copyPrompt(text: string) {
  navigator.clipboard.writeText(text);
}

/**
 * Download text content as a file
 * @param content - The text content to download
 * @param filename - The filename for the downloaded file
 */
export function downloadPrompt(
  content: string,
  filename: string
) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
