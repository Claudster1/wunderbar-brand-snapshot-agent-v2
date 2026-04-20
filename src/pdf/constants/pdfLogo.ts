import path from "node:path";

/**
 * Absolute path to a PNG logo for @react-pdf/renderer.
 * WebP URLs log "Not valid image extension" and can produce PDFs that fail in some viewers.
 */
export const PDF_WUNDERBAR_LOGO_SRC = path.join(process.cwd(), "public", "assets", "pdf", "wunderbar-logo.png");
