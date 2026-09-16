"use client";

import { useEffect, useState } from "react";
import { isBlueprintLogoTier, type BlueprintLogoTier } from "@/lib/brandLogo";
import { getPersistedEmail } from "@/lib/persistEmail";

type LogoPayload = {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
};

type UploadedBrandLogoProps = {
  email?: string | null;
  tier?: string | null;
  /** Compact for Foundation; default matches Brand Standards cards */
  variant?: "card" | "compact";
  /** When no logo is marked, show a CTA empty state (Blueprint tiers only). */
  showEmptyState?: boolean;
};

type CacheEntry = { at: number; logo: LogoPayload | null };
const logoCache = new Map<string, CacheEntry>();
const LOGO_CACHE_TTL_MS = 60_000;

function cacheKey(email: string, tier: string) {
  return `${email}::${tier}`;
}

/**
 * Fetches and embeds the user's primary uploaded logo (Blueprint / Blueprint+ only).
 * Optionally shows an empty-state CTA when no logo is marked.
 */
export function UploadedBrandLogo({
  email,
  tier,
  variant = "card",
  showEmptyState = false,
}: UploadedBrandLogoProps) {
  const [logo, setLogo] = useState<LogoPayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">(
    "idle"
  );

  const resolvedTier = isBlueprintLogoTier(tier) ? (tier as BlueprintLogoTier) : null;
  const resolvedEmail = (email || getPersistedEmail() || "").trim().toLowerCase();

  useEffect(() => {
    if (!resolvedTier || !resolvedEmail.includes("@")) {
      setStatus("empty");
      setLogo(null);
      return;
    }

    const key = cacheKey(resolvedEmail, resolvedTier);
    const cached = logoCache.get(key);
    if (cached && Date.now() - cached.at < LOGO_CACHE_TTL_MS) {
      setLogo(cached.logo);
      setStatus(cached.logo ? "ready" : "empty");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setStatus("loading");

    fetch(
      `/api/assets/logo?email=${encodeURIComponent(resolvedEmail)}&tier=${encodeURIComponent(resolvedTier)}`,
      { signal: controller.signal, credentials: "same-origin" }
    )
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          // Do not cache auth failures — session may appear moments later.
          return { logo: null as LogoPayload | null, cache: false };
        }
        if (!res.ok) throw new Error("logo fetch failed");
        const data = (await res.json()) as { logo: LogoPayload | null };
        return { logo: data.logo, cache: true };
      })
      .then((data) => {
        if (cancelled) return;
        const next = data.logo?.url ? data.logo : null;
        if (data.cache) {
          logoCache.set(key, { at: Date.now(), logo: next });
        }
        if (next) {
          setLogo(next);
          setStatus("ready");
        } else {
          setLogo(null);
          setStatus("empty");
        }
      })
      .catch((err: { name?: string } | undefined) => {
        if (cancelled || err?.name === "AbortError") return;
        setLogo(null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [resolvedEmail, resolvedTier]);

  if (!resolvedTier) return null;

  if (status === "idle" || status === "loading") {
    if (!showEmptyState) return null;
    if (variant === "compact") {
      return (
        <div className="mb-4 rounded-md border border-brand-border bg-white p-3 animate-pulse">
          <div className="h-3 w-28 rounded bg-slate-200 mb-3" />
          <div className="h-24 rounded-md bg-slate-100" />
        </div>
      );
    }
    return (
      <div
        style={{
          marginTop: 12,
          marginBottom: 4,
          border: "1px solid #E6EAF2",
          borderRadius: 8,
          background: "#FFFFFF",
          padding: "12px 14px",
        }}
      >
        <div style={{ height: 10, width: 110, background: "#E2E8F0", borderRadius: 4 }} />
        <div
          style={{
            marginTop: 10,
            height: 96,
            borderRadius: 6,
            background: "#F1F5F9",
          }}
        />
      </div>
    );
  }

  if (status === "ready" && logo) {
    if (variant === "compact") {
      return (
        <div className="mb-4 rounded-md border border-brand-border bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue mb-2">
            Your uploaded logo
          </p>
          <div className="flex items-center justify-center rounded-md bg-[#F8FAFC] border border-brand-border px-4 py-6 min-h-[96px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.url}
              alt={`${logo.fileName} — primary brand logo`}
              style={{ maxHeight: 96, maxWidth: "100%", objectFit: "contain" }}
            />
          </div>
          <p className="text-sm text-brand-muted mt-2 mb-0 leading-relaxed">
            Shown from your Blueprint upload. Keep this file as the master reference for lockups and
            exports.
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          marginTop: 12,
          marginBottom: 4,
          border: "1px solid #E6EAF2",
          borderRadius: 8,
          background: "#FFFFFF",
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: "#07B0F2",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Your uploaded logo
        </p>
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 112,
            padding: "16px 20px",
            borderRadius: 6,
            background: "#F8FAFC",
            border: "1px solid #E6EAF2",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.url}
            alt={`${logo.fileName} — primary brand logo`}
            style={{ maxHeight: 112, maxWidth: "100%", objectFit: "contain" }}
          />
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "#5A6B7E", lineHeight: 1.55 }}>
          Embedded from your Blueprint materials ({logo.fileName}). Usage rules below govern how this
          mark appears across surfaces.
        </p>
      </div>
    );
  }

  if (!showEmptyState || status === "error") {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="mb-4 rounded-md border border-dashed border-brand-border bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue mb-2">
          Add your logo
        </p>
        <p className="text-sm sm:text-base text-brand-midnight m-0 leading-relaxed">
          Upload or mark a primary logo during intake to make this guide contractor-ready — it will
          embed here and in Brand Standards PDF exports. Until then, use the interim wordmark path
          below.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        marginBottom: 4,
        border: "1px dashed #CBD5E1",
        borderRadius: 8,
        background: "#F8FAFC",
        padding: "12px 14px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "#07B0F2",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Add your logo
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "#334155", lineHeight: 1.55 }}>
        Mark a primary logo from your Blueprint uploads to make this guide contractor-ready. It
        embeds on-screen and in PDF exports. Until then, use the interim wordmark path with the
        same clear-space rules.
      </p>
    </div>
  );
}

/** Test/helper: clear in-memory logo cache (e.g. after upload in same session). */
export function clearUploadedBrandLogoCache() {
  logoCache.clear();
}
