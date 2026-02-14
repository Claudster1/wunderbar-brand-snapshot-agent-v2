// lib/security/index.ts
// Centralized security utilities for WunderBrand Snapshot™

export { apiGuard, safeErrorResponse } from "./apiGuard";
export type { ApiGuardConfig, ApiGuardResult } from "./apiGuard";

export {
  checkRateLimit,
  getClientIp,
  AI_RATE_LIMIT,
  GENERAL_RATE_LIMIT,
  AUTH_RATE_LIMIT,
  EMAIL_RATE_LIMIT,
} from "./rateLimit";
export type { RateLimitConfig, RateLimitResult } from "./rateLimit";

export {
  sanitizeString,
  isValidEmail,
  isValidUUID,
  sanitizeObject,
} from "./inputValidation";
