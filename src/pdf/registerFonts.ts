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
      fontWeight: "500",
    },
    {
      src: "/fonts/Inter-SemiBold.ttf",
      fontWeight: "600",
    },
    {
      src: "/fonts/Inter-Bold.ttf",
      fontWeight: "700",
    },
  ],
});

// Helvetica Neue fallback (system)
Font.register({
  family: "Helvetica Neue",
  fonts: [
    {
      src: undefined, // system font
      fontWeight: "normal",
    },
    {
      src: undefined, // system font
      fontWeight: "bold",
    },
  ],
});

// Generic sans fallback
Font.register({
  family: "System Sans",
  fonts: [
    {
      src: undefined,
    },
  ],
});

export const registerPdfFonts = () => true;
