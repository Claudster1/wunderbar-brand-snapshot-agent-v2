// src/pdf/registerFonts.ts
// Centralized font registration for PDF documents.
// Falls back safely when local font files are missing.

import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

function resolveFontPath(filename: string): string | null {
  const abs = path.join(process.cwd(), "public", "fonts", filename);
  return fs.existsSync(abs) ? abs : null;
}

export const registerPdfFonts = () => {
  if (fontsRegistered) return true;

  const interFonts = [
    { file: "Inter-Regular.ttf", fontWeight: "normal" as const },
    { file: "Inter-Medium.ttf", fontWeight: "medium" as const },
    { file: "Inter-SemiBold.ttf", fontWeight: "semibold" as const },
    { file: "Inter-Bold.ttf", fontWeight: "bold" as const },
  ]
    .map(({ file, fontWeight }) => {
      const src = resolveFontPath(file);
      return src ? { src, fontWeight } : null;
    })
    .filter((item): item is { src: string; fontWeight: "normal" | "medium" | "semibold" | "bold" } => Boolean(item));

  if (interFonts.length > 0) {
    try {
      Font.register({
        family: "Inter",
        fonts: interFonts,
      });
    } catch {
      // Keep PDF generation alive with built-in font fallbacks.
    }
  }

  fontsRegistered = true;
  return true;
};
