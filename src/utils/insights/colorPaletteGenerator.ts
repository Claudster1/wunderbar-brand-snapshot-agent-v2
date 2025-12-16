// src/utils/insights/colorPaletteGenerator.ts
// Placeholder color palette generator.

export type ColorPaletteItem = {
  name: string;
  hex: string;
  role: "Primary" | "Secondary" | "Accent";
  meaning: string;
};

export function generateColorPaletteForPersona(_persona?: string): ColorPaletteItem[] {
  return [
    { name: "Deep Navy", hex: "#021859", role: "Primary", meaning: "Confidence & stability" },
    { name: "Bright Blue", hex: "#07B0F2", role: "Secondary", meaning: "Clarity & momentum" },
    { name: "Aqua", hex: "#27CDF2", role: "Accent", meaning: "Energy & freshness" },
  ];
}


