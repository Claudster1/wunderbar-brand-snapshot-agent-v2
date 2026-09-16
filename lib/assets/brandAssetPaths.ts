// Safe storage path helpers for brand asset uploads (Supabase Storage).
// Pure utilities — safe for tests; no server-only imports.

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

/** Filename heuristics — used at upload time; user can also mark an image as logo. */
export function isLikelyLogoFilename(fileName: string): boolean {
  return /(logo|wordmark|lockup|logotype|brand[\s_-]?mark|monogram)/i.test(fileName);
}

/** Strip path traversal / odd characters from a storage path segment. */
export function safeStorageSegment(input: string | null | undefined, fallback: string): string {
  const raw = (input ?? "").trim();
  const cleaned = raw
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.replace(/[^a-zA-Z0-9._@+-]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 128);
  return cleaned && cleaned.length > 0 ? cleaned : fallback;
}

/** Prefer MIME-derived extension; never trust raw multi-dot / path filenames. */
export function safeFileExtension(mimeType: string, fileName: string): string {
  const fromMime = MIME_EXTENSION[mimeType];
  if (fromMime) return fromMime;
  const base = fileName.split(/[/\\]/).pop() ?? "";
  const parts = base.split(".");
  if (parts.length < 2) return "bin";
  const ext = parts.pop()?.toLowerCase() ?? "";
  if (/^[a-z0-9]{1,8}$/.test(ext)) return ext;
  return "bin";
}

export function buildBrandAssetStoragePath(opts: {
  email: string;
  sessionId?: string | null;
  fileId: string;
  mimeType: string;
  fileName: string;
}): string {
  const emailSeg = safeStorageSegment(opts.email.toLowerCase(), "unknown");
  const sessionSeg = safeStorageSegment(opts.sessionId, "direct");
  const ext = safeFileExtension(opts.mimeType, opts.fileName);
  const fileId = safeStorageSegment(opts.fileId, "file");
  return `${emailSeg}/${sessionSeg}/${fileId}.${ext}`;
}

export function categorizeUploadedAsset(fileName: string, mimeType: string): string {
  const lower = fileName.toLowerCase();
  if (mimeType.startsWith("image/") && isLikelyLogoFilename(fileName)) return "logo";
  if (mimeType.startsWith("image/")) return "image";
  if (lower.endsWith(".pdf")) return "document";
  if (lower.endsWith(".pptx")) return "presentation";
  if (lower.endsWith(".docx")) return "document";
  if (/deck|presentation|slide/i.test(lower)) return "presentation";
  if (/email|newsletter/i.test(lower)) return "email";
  if (/collateral|brochure|flyer/i.test(lower)) return "collateral";
  return "other";
}

/** Map createSignedUrls results → path → url (index fallback if path missing). */
export function mapSignedPreviewUrls(
  paths: string[],
  signed:
    | Array<{ path?: string | null; signedUrl?: string | null; error?: string | null } | null>
    | null
    | undefined
): Map<string, string> {
  const out = new Map<string, string>();
  if (!signed?.length) return out;
  signed.forEach((item, i) => {
    if (!item || item.error || !item.signedUrl) return;
    const key = (item.path && String(item.path)) || paths[i];
    if (key) out.set(key, item.signedUrl);
  });
  return out;
}

/** True when a URL is safe to embed in PDF/img (https only). */
export function isHttpsImageUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
