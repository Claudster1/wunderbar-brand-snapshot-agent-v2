// src/pdf/registerFonts.ts
// Centralized font registration for all PDF documents
// Ensures consistent font usage across Brand Snapshot™, Snapshot+™, Blueprint™, and Blueprint+™

import { Font } from "@react-pdf/renderer";

// Inter (primary)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "/fonts/Inter-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/Inter-Medium.ttf",
      fontWeight: "medium",
    },
    {
      src: "/fonts/Inter-SemiBold.ttf",
      fontWeight: "semibold",
    },
    {
      src: "/fonts/Inter-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

// Helvetica Neue fallback (system) - src omitted for system font
Font.register({
  family: "Helvetica Neue",
  fonts: [
    { src: "" as unknown as string, fontWeight: "normal" },
    { src: "" as unknown as string, fontWeight: "bold" },
  ],
});

// Generic sans fallback
Font.register({
  family: "System Sans",
  fonts: [{ src: "" as unknown as string }],
});

export const registerPdfFonts = () => true;
