// Legacy re-exports (for backward compatibility)
export { default as ReportDocument } from "./ReportDocument";
export * from "./ReportDocument";

// New ReportDocument (Snapshot+ focused report)
export { ReportDocument as SnapshotPlusReportDocument } from "./documents/ReportDocument";
export type { ReportProps, Pillar } from "./documents/ReportDocument";
export { BlueprintReport } from "./BlueprintReport";

export { SnapshotPlusDocument } from "./SnapshotPlusDocument";
export * from "./SnapshotPlusDocument";

export { default as BlueprintDocument } from "./BlueprintDocument";
export * from "./BlueprintDocument";

export { default as BlueprintPlusDocument } from "./BlueprintPlusDocument";
export * from "./BlueprintPlusDocument";

// New unified PDF documents (use reusable components)
export { BrandSnapshotPDF } from "./BrandSnapshotPDF";
export type { BrandSnapshotReport } from "./BrandSnapshotPDF";

export { BrandSnapshotPlusPDF } from "./BrandSnapshotPlusPDF";
export type { BrandSnapshotPlusReport } from "./BrandSnapshotPlusPDF";

export { BrandBlueprintPDF } from "./BrandBlueprintPDF";
export type { BrandBlueprintReport } from "./BrandBlueprintPDF";

// Legacy document exports (from documents directory - kept for backward compatibility)
// Note: These are placeholders and may be removed once all code is migrated
export { default as BrandSnapshotPDFLegacy } from "./documents/BrandSnapshotPDF";
export { default as SnapshotPlusPDFLegacy } from "./documents/SnapshotPlusPDF";
export { default as BrandBlueprintPDFLegacy } from "./documents/BrandBlueprintPDF";
export { default as BrandBlueprintPlusPDF } from "./documents/BrandBlueprintPlusPDF";

// Blueprint Document Suite
export { CompleteBlueprintDocument } from "./documents/CompleteBlueprintDocument";
export { ExecutiveSummaryDocument } from "./documents/ExecutiveSummaryDocument";
export { MessagingPlaybookDocument } from "./documents/MessagingPlaybookDocument";
export { PromptLibraryDocument } from "./documents/PromptLibraryDocument";
export { ActivationPlanDocument } from "./documents/ActivationPlanDocument";
export { DigitalStrategyDocument } from "./documents/DigitalStrategyDocument";
export { CompetitiveIntelDocument } from "./documents/CompetitiveIntelDocument";
export type { BlueprintEngineOutput } from "./types/blueprintReport";

// Component exports
export * from "./components";

// Theme exports
export { default as theme, pdfTheme, colors, fonts, spacing, layout, stylePresets } from "./theme";
export {
  getMeterFillColor,
  getMeterFill,
  getCol,
  getColorSwatch,
  getScoreLabel,
  getPillarScoreLabel,
} from "./theme";

// PDF Generation exports
export {
  generatePdf,
  generatePdfResponse,
  generatePdfFromReport,
  generatePdfResponseFromReport,
  transformReportDataForPdf,
  type PDFDocumentType,
  type PDFGenerationOptions,
} from "./generatePdf";
// Note: Document types are exported from their respective document files above

// Font registration
export { registerPdfFonts } from "./registerFonts";
