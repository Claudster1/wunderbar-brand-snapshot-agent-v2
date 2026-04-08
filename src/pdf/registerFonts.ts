// src/pdf/registerFonts.ts
// Centralized font registration for PDF documents.
// Prefers bundled TTFs in public/fonts when present; otherwise loads Latin .woff2 from @fontsource.

import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

let fontsRegistered = false;

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
  const fonts = [300, 400, 700, 900]
    .map((n) => {
      const src = fontsourceWoff2("lato", `lato-latin-${n}-normal.woff2`);
      return src ? { src, fontWeight: n } : null;
    })
    .filter((x): x is { src: string; fontWeight: number } => Boolean(x));
  if (fonts.length > 0) {
    Font.register({ family: "Lato", fonts });
  }
}

function registerMerriweather(): void {
  const fonts = [400, 500, 600, 700]
    .map((n) => {
      const src = fontsourceWoff2("merriweather", `merriweather-latin-${n}-normal.woff2`);
      return src ? { src, fontWeight: n } : null;
    })
    .filter((x): x is { src: string; fontWeight: number } => Boolean(x));
  if (fonts.length > 0) {
    Font.register({ family: "Merriweather", fonts });
  }
}

export const registerPdfFonts = () => {
  if (fontsRegistered) return true;

  try {
    registerInter();
    registerLato();
    registerMerriweather();
  } catch {
    // Keep PDF generation alive with built-in font fallbacks.
  }

  fontsRegistered = true;
  return true;
};
