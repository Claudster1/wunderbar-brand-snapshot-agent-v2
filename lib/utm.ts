// lib/utm.ts
// Append/override UTM params on a URL so traffic the app drives (SMS, email,
// outbound links) is attributable in analytics. Overrides any existing utm_* on
// the URL (e.g. a product URL that already carries email-medium UTMs) so the
// channel is always correct for where the link is actually used.

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export function withUtm(url: string, params: UtmParams): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    const map: Record<string, string | undefined> = {
      utm_source: params.source,
      utm_medium: params.medium,
      utm_campaign: params.campaign,
      utm_content: params.content,
      utm_term: params.term,
    };
    for (const [key, value] of Object.entries(map)) {
      if (value) u.searchParams.set(key, value);
    }
    return u.toString();
  } catch {
    return url;
  }
}
