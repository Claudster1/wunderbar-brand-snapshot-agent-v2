"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { clearUploadedBrandLogoCache } from "@/components/brand/UploadedBrandLogo";

interface UploadedAsset {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  asset_category: string;
  created_at: string;
  preview_url?: string | null;
}

interface AssetUploadPanelProps {
  email: string;
  tier: "blueprint" | "blueprint-plus";
  sessionId?: string;
  onAssetsChange?: (assets: UploadedAsset[]) => void;
}

const TIER_CONFIG = {
  blueprint: {
    maxFiles: 3,
    label: "Blueprint\u2122",
    accept: "image/jpeg,image/png,image/webp,image/gif,application/pdf",
    description: "images and PDFs",
  },
  "blueprint-plus": {
    maxFiles: 10,
    label: "Blueprint+\u2122",
    accept:
      "image/jpeg,image/png,image/webp,image/gif,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    description: "images, PDFs, PPTX, and DOCX",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  logo: "\uD83C\uDFA8",
  image: "\uD83D\uDDBC\uFE0F",
  document: "\uD83D\uDCC4",
  presentation: "\uD83D\uDCCA",
  email: "\u2709\uFE0F",
  collateral: "\uD83D\uDCCB",
  other: "\uD83D\uDCC1",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetUploadPanel({
  email,
  tier,
  sessionId,
  onAssetsChange,
}: AssetUploadPanelProps) {
  const config = TIER_CONFIG[tier];
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [remaining, setRemaining] = useState(config.maxFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoff, setPayoff] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/assets/list?email=${encodeURIComponent(email)}&tier=${tier}`,
        { credentials: "same-origin" }
      );
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets);
        setRemaining(data.remaining);
        onAssetsChange?.(data.assets);
      }
    } catch {
      // silent
    }
  }, [email, tier, onAssetsChange]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    if (!payoff) return;
    const t = window.setTimeout(() => setPayoff(null), 8000);
    return () => window.clearTimeout(t);
  }, [payoff]);

  const uploadFile = async (file: File) => {
    setError(null);
    setPayoff(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);
      formData.append("tier", tier);
      if (sessionId) formData.append("sessionId", sessionId);

      const res = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      await fetchAssets();
      if (data.asset?.asset_category === "logo") {
        clearUploadedBrandLogoCache();
        setPayoff(
          "Primary logo saved — it will appear in Foundation → Logo System and your Brand Standards PDF."
        );
      } else if (data.asset?.file_type?.startsWith("image/")) {
        setPayoff(
          "Uploaded. Tap Use as logo on an image to embed it in Foundation and Brand Standards exports."
        );
      } else {
        setPayoff("Uploaded — we’ll factor this into your diagnostic analysis.");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const setAsPrimaryLogo = async (id: string) => {
    setError(null);
    setPayoff(null);
    try {
      const res = await fetch("/api/assets/set-primary-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier, assetId: id }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not set logo.");
        return;
      }
      await fetchAssets();
      clearUploadedBrandLogoCache();
      setPayoff(
        "Primary logo set — it will appear in Foundation → Logo System and your Brand Standards PDF."
      );
    } catch {
      setError("Could not set logo. Please try again.");
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const res = await fetch("/api/assets/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email }),
        credentials: "same-origin",
      });

      if (res.ok) {
        const updated = assets.filter((a) => a.id !== id);
        setAssets(updated);
        setRemaining((r) => r + 1);
        onAssetsChange?.(updated);
        setPayoff(null);
        clearUploadedBrandLogoCache();
      }
    } catch {
      // silent
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const hasPrimaryLogo = assets.some((a) => a.asset_category === "logo");

  return (
    <div
      style={{
        background: "#F8FAFD",
        border: "1px solid #E6EAF2",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#07B0F2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#021859" }}>
            Upload Brand Materials
            {assets.length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: "#07B0F2",
                  fontWeight: 500,
                }}
              >
                ({assets.length}/{config.maxFiles})
              </span>
            )}
            {hasPrimaryLogo ? (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#047857",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: 4,
                  padding: "2px 6px",
                }}
              >
                Logo ready
              </span>
            ) : null}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          <p
            style={{
              fontSize: 12,
              color: "#5A6B7E",
              lineHeight: 1.5,
              margin: "0 0 10px",
            }}
          >
            Share style guides, logos, decks, or collateral. Mark one image as your{" "}
            <strong>primary logo</strong> so it embeds in Foundation and Brand Standards
            (on-screen + PDF).{" "}
            <strong>
              {config.label}: up to {config.maxFiles} files
            </strong>{" "}
            ({config.description}, max 20 MB each).
          </p>

          {remaining > 0 && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#07B0F2" : "#D1D5DB"}`,
                borderRadius: 8,
                padding: "16px 12px",
                textAlign: "center",
                cursor: uploading ? "wait" : "pointer",
                background: dragOver ? "#EBF8FF" : "#FFFFFF",
                transition: "all 0.15s",
                marginBottom: 10,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={config.accept}
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: "none" }}
              />
              {uploading ? (
                <span style={{ fontSize: 13, color: "#07B0F2", fontWeight: 500 }}>
                  Uploading...
                </span>
              ) : (
                <>
                  <span style={{ fontSize: 13, color: "#5A6B7E", fontWeight: 500 }}>
                    Drag &amp; drop a file here, or{" "}
                    <span style={{ color: "#07B0F2", textDecoration: "underline" }}>
                      browse
                    </span>
                  </span>
                  <br />
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                    Prefer a PNG/SVG-style logo export · {remaining} slot
                    {remaining !== 1 ? "s" : ""} left
                  </span>
                </>
              )}
            </div>
          )}

          {payoff && (
            <p
              style={{
                fontSize: 12,
                color: "#065F46",
                margin: "0 0 8px",
                padding: "8px 10px",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: 6,
                lineHeight: 1.45,
              }}
            >
              {payoff}
            </p>
          )}

          {error && (
            <p
              style={{
                fontSize: 12,
                color: "#DC2626",
                margin: "0 0 8px",
                padding: "6px 10px",
                background: "#FEF2F2",
                borderRadius: 6,
              }}
            >
              {error}
            </p>
          )}

          {assets.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {assets.map((asset) => {
                const isLogo = asset.asset_category === "logo";
                const isImage = asset.file_type.startsWith("image/");
                return (
                  <div
                    key={asset.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      background: isLogo ? "#F0FDF9" : "#FFFFFF",
                      border: isLogo ? "1px solid #A7F3D0" : "1px solid #E6EAF2",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          border: "1px solid #E6EAF2",
                          background: "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {isImage && asset.preview_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.preview_url}
                            alt=""
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 16 }}>
                            {CATEGORY_ICONS[asset.asset_category] || CATEGORY_ICONS.other}
                          </span>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#021859",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {asset.file_name}
                        </div>
                        <div style={{ color: "#9CA3AF", fontSize: 11 }}>
                          {formatFileSize(asset.file_size)} &middot;{" "}
                          {isLogo ? "primary logo" : asset.asset_category}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      {isImage && !isLogo ? (
                        <button
                          type="button"
                          onClick={() => setAsPrimaryLogo(asset.id)}
                          style={{
                            background: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            borderRadius: 5,
                            cursor: "pointer",
                            color: "#1D4ED8",
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                          }}
                          title="Embed this image in Foundation and Brand Standards"
                        >
                          Use as logo
                        </button>
                      ) : null}
                      {isLogo ? (
                        <span
                          style={{
                            background: "#ECFDF5",
                            border: "1px solid #A7F3D0",
                            borderRadius: 5,
                            color: "#047857",
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Logo
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => deleteAsset(asset.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#9CA3AF",
                          padding: "2px 6px",
                          fontSize: 14,
                          lineHeight: 1,
                        }}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {remaining === 0 && assets.length > 0 && (
            <p
              style={{
                fontSize: 11,
                color: "#059669",
                margin: "8px 0 0",
                fontWeight: 500,
              }}
            >
              All {config.maxFiles} upload slots used. Remove a file to upload a different one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
