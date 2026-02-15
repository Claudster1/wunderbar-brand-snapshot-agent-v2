// lib/security/securityEvents.ts
// Structured security event logging.
// Events are logged to the console (structured JSON in production)
// and optionally stored in Supabase for pattern analysis.
//
// Usage:
//   import { logSecurityEvent } from "@/lib/security/securityEvents";
//   logSecurityEvent("turnstile_failed", { ip, reportId });

import { logger } from "@/lib/logger";

export type SecurityEventType =
  | "turnstile_failed"
  | "turnstile_missing_production"
  | "behavioral_score_blocked"
  | "email_disposable_blocked"
  | "email_mx_failed"
  | "verification_lockout"
  | "verification_failed"
  | "tier_token_invalid"
  | "body_size_exceeded"
  | "rate_limit_hit"
  | "honeypot_triggered"
  | "report_access_denied"
  | "stripe_price_rejected"
  | "suspicious_activity";

export interface SecurityEvent {
  type: SecurityEventType;
  ip?: string | null;
  reportId?: string | null;
  email?: string | null;
  userAgent?: string | null;
  meta?: Record<string, unknown>;
}

/**
 * Log a security event. Always logs to structured console output.
 * In production, also attempts to persist to Supabase (non-blocking).
 */
export function logSecurityEvent(
  type: SecurityEventType,
  details: Omit<SecurityEvent, "type"> = {}
): void {
  const event: SecurityEvent = { type, ...details };

  // Always log to console (structured in production via logger)
  logger.warn(`[SECURITY] ${type}`, event as unknown as Record<string, unknown>);

  // Persist to Supabase in the background (non-blocking, best-effort)
  if (process.env.NODE_ENV === "production") {
    persistEvent(event).catch(() => {
      // Silently ignore — logging should never break the app
    });
  }
}

async function persistEvent(event: SecurityEvent): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    if (!supabaseAdmin) return;

    await supabaseAdmin.from("security_events").insert({
      event_type: event.type,
      ip_address: event.ip || null,
      report_id: event.reportId || null,
      email: event.email || null,
      user_agent: event.userAgent || null,
      metadata: event.meta || {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Best-effort — never throw from security logging
  }
}

/**
 * Extract common security context from a request.
 * Useful for passing to logSecurityEvent.
 */
export function getRequestContext(req: Request) {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    userAgent: req.headers.get("user-agent") || null,
  };
}
