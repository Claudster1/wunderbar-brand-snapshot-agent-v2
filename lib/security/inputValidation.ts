// lib/security/inputValidation.ts
// Input sanitization utilities for API routes.
// SECURITY: Prevents XSS, injection attacks, and malformed data.

/**
 * Sanitize a string by removing potentially dangerous HTML/script content.
 * Use for user-provided text fields before storing or logging.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, 10_000); // Hard limit: 10K characters per field
}

/**
 * Validate an email address format.
 */
export function isValidEmail(input: unknown): input is string {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  // Basic but effective email regex (no overly permissive patterns)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254;
}

/**
 * Validate a UUID v4 format (used for report IDs).
 */
export function isValidUUID(input: unknown): input is string {
  if (typeof input !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
}

/**
 * Sanitize an entire object (shallow — sanitizes string values only).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key]);
    }
  }
  return sanitized;
}
