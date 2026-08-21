// src/pdf/registerFonts.ts
// Prefer bundled TTFs in public/fonts — react-pdf embeds these reliably.
// WOFF2 from @fontsource is a fallback only (can drop glyphs / hide text).

import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

type FontFace = {
  src: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
};

function resolvePublicFont(filename: string): string | null {
  const abs = path.join(process.cwd(), "public", "fonts", filename);
  return fs.existsSync(abs) ? abs : null;
}

function fontsourceWoff2(packageName: string, filename: string): string | null {
  const abs = path.join(process.cwd(), "node_modules", "@fontsource", packageName, "files", filename);
  return fs.existsSync(abs) ? abs : null;
}

function registerInter(): void {
  const interTtf = [
    { file: "Inter-Regular.ttf", fontWeight: 400 },
    { file: "Inter-Medium.ttf", fontWeight: 500 },
    { file: "Inter-SemiBold.ttf", fontWeight: 600 },
    { file: "Inter-Bold.ttf", fontWeight: 700 },
  ]
    .map(({ file, fontWeight }) => {
      const src = resolvePublicFont(file);
      return src ? { src, fontWeight } : null;
    })
    .filter((x): x is { src: string; fontWeight: number } => Boolean(x));

  if (interTtf.length >= 2) {
    Font.register({ family: "Inter", fonts: interTtf });
    return;
  }

  const interWoff = [400, 500, 600, 700]
    .map((n) => {
      const src = fontsourceWoff2("inter", `inter-latin-${n}-normal.woff2`);
      return src ? { src, fontWeight: n } : null;
    })
    .filter((x): x is { src: string; fontWeight: number } => Boolean(x));

  if (interWoff.length > 0) {
    Font.register({ family: "Inter", fonts: interWoff });
  }
}

function registerLato(): void {
  const ttfCandidates: Array<{ file: string; fontWeight: number; fontStyle: "normal" | "italic" }> = [
    { file: "Lato-Regular.ttf", fontWeight: 400, fontStyle: "normal" },
    { file: "Lato-Bold.ttf", fontWeight: 700, fontStyle: "normal" },
    { file: "Lato-Black.ttf", fontWeight: 900, fontStyle: "normal" },
    // Map UI semibold (600) → Bold so weight requests never miss
    { file: "Lato-Bold.ttf", fontWeight: 600, fontStyle: "normal" },
    { file: "Lato-Bold.ttf", fontWeight: 500, fontStyle: "normal" },
    { file: "Lato-Italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { file: "Lato-BoldItalic.ttf", fontWeight: 700, fontStyle: "italic" },
    { file: "Lato-BoldItalic.ttf", fontWeight: 600, fontStyle: "italic" },
    { file: "Lato-BoldItalic.ttf", fontWeight: 900, fontStyle: "italic" },
  ];

  const ttf: FontFace[] = [];
  for (const { file, fontWeight, fontStyle } of ttfCandidates) {
    const src = resolvePublicFont(file);
    if (src) ttf.push({ src, fontWeight, fontStyle });
  }

  if (ttf.length >= 2) {
    Font.register({ family: "Lato", fonts: ttf });
    return;
  }

  // Fallback: fontsource woff2 (less reliable in react-pdf)
  const weightFiles: Array<{ weight: number; style: "normal" | "italic"; file: string }> = [
    { weight: 400, style: "normal", file: "lato-latin-400-normal.woff2" },
    { weight: 600, style: "normal", file: "lato-latin-700-normal.woff2" },
    { weight: 700, style: "normal", file: "lato-latin-700-normal.woff2" },
    { weight: 900, style: "normal", file: "lato-latin-900-normal.woff2" },
    { weight: 400, style: "italic", file: "lato-latin-400-italic.woff2" },
    { weight: 700, style: "italic", file: "lato-latin-700-italic.woff2" },
  ];

  const fonts: FontFace[] = [];
  for (const { weight, style, file } of weightFiles) {
    const src = fontsourceWoff2("lato", file);
    if (src) fonts.push({ src, fontWeight: weight, fontStyle: style });
  }

  if (fonts.length > 0) {
    Font.register({ family: "Lato", fonts });
  }
}

export const registerPdfFonts = () => {
  if (fontsRegistered) return true;

  try {
    registerInter();
    registerLato();
  } catch {
    // Keep PDF generation alive with built-in font fallbacks.
  }

  fontsRegistered = true;
  return true;
};

/** Test helper — force re-register (dev only). */
export const resetPdfFontsForTests = () => {
  fontsRegistered = false;
};
