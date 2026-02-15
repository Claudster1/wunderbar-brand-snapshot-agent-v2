// lib/security/emailValidation.ts
// Enhanced email validation: format check, disposable domain blocking, MX record verification.

import dns from "dns";

// Disposable email domain list (open-source, updated by community)
let disposableDomains: Set<string> | null = null;

function getDisposableDomains(): Set<string> {
  if (!disposableDomains) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const list: string[] = require("disposable-email-domains");
      disposableDomains = new Set(list.map((d: string) => d.toLowerCase()));
    } catch {
      console.warn("[emailValidation] disposable-email-domains package not found");
      disposableDomains = new Set();
    }
  }
  return disposableDomains;
}

/**
 * Check basic email format (same regex as isValidEmail but returns the parts).
 */
function parseEmail(email: string): { local: string; domain: string } | null {
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > 254) return null;
  const match = trimmed.match(/^([^\s@]+)@([^\s@]+\.[^\s@]+)$/);
  if (!match) return null;
  return { local: match[1], domain: match[2] };
}

/**
 * Check if the email domain is a known disposable/throwaway email service.
 */
export function isDisposableEmail(email: string): boolean {
  const parsed = parseEmail(email);
  if (!parsed) return false;
  return getDisposableDomains().has(parsed.domain);
}

/**
 * Verify the email domain has valid MX records (mail servers).
 * Returns true if MX records exist, false if the domain can't receive mail.
 * Times out after 3 seconds to avoid blocking the request.
 */
export async function hasMxRecords(email: string): Promise<boolean> {
  const parsed = parseEmail(email);
  if (!parsed) return false;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      // On timeout, fail closed — reject the domain
      resolve(false);
    }, 3000);

    dns.resolveMx(parsed.domain, (err, addresses) => {
      clearTimeout(timeout);
      if (err || !addresses || addresses.length === 0) {
        // No MX records — also try A record as fallback (some domains use A instead of MX)
        dns.resolve4(parsed.domain, (aErr, aAddresses) => {
          resolve(!aErr && aAddresses != null && aAddresses.length > 0);
        });
        return;
      }
      resolve(true);
    });
  });
}

export interface EmailValidationResult {
  valid: boolean;
  /** Internal reason — logged server-side only. Do NOT expose to client in production. */
  reason?: "invalid_format" | "disposable_domain" | "no_mx_records";
  friendlyMessage?: string;
}

/**
 * Full email validation pipeline:
 * 1. Format check
 * 2. Disposable domain check
 * 3. MX record verification
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const parsed = parseEmail(email);
  if (!parsed) {
    return {
      valid: false,
      reason: "invalid_format",
      friendlyMessage: "Please enter a valid email address.",
    };
  }

  if (isDisposableEmail(email)) {
    return {
      valid: false,
      reason: "disposable_domain",
      // Use a generic message to avoid revealing why we rejected it
      friendlyMessage:
        "We couldn't verify that email address. Please use your work or personal email and try again.",
    };
  }

  const hasMx = await hasMxRecords(email);
  if (!hasMx) {
    return {
      valid: false,
      reason: "no_mx_records",
      friendlyMessage:
        "We couldn't verify that email address. Please double-check and try again.",
    };
  }

  return { valid: true };
}
