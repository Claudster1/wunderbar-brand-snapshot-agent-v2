// POST /api/assets/upload
// Handles marketing asset uploads for Blueprint/Blueprint+ diagnostics.
// Stores files in Supabase Storage (brand-assets bucket) and tracks metadata.

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const TIER_LIMITS: Record<string, { maxFiles: number; allowedTypes: string[] }> = {
  blueprint: {
    maxFiles: 3,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"],
  },
  "blueprint-plus": {
    maxFiles: 10,
    allowedTypes: [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function categorizeAsset(fileName: string, mimeType: string): string {
  const lower = fileName.toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (lower.endsWith(".pdf")) return "document";
  if (lower.endsWith(".pptx")) return "presentation";
  if (lower.endsWith(".docx")) return "document";
  if (/deck|presentation|slide/i.test(lower)) return "presentation";
  if (/email|newsletter/i.test(lower)) return "email";
  if (/collateral|brochure|flyer/i.test(lower)) return "collateral";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const email = formData.get("email") as string | null;
    const tier = formData.get("tier") as string | null;
    const sessionId = formData.get("sessionId") as string | null;

    if (!file || !email || !tier) {
      return NextResponse.json(
        { error: "Missing required fields: file, email, tier" },
        { status: 400 }
      );
    }

    const tierConfig = TIER_LIMITS[tier];
    if (!tierConfig) {
      return NextResponse.json(
        { error: "Asset uploads are available for Blueprint™ and Blueprint+™ only." },
        { status: 403 }
      );
    }

    if (!tierConfig.allowedTypes.includes(file.type)) {
      const allowed = tier === "blueprint"
        ? "images and PDFs"
        : "images, PDFs, PPTX, and DOCX files";
      return NextResponse.json(
        { error: `File type not allowed. ${tierConfig.maxFiles === 3 ? "Blueprint™" : "Blueprint+™"} accepts ${allowed}.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 20 MB." },
        { status: 400 }
      );
    }

    const sb = supabaseServer();

    // Check existing upload count
    const { count } = await sb
      .from("brand_asset_uploads")
      .select("id", { count: "exact", head: true })
      .eq("user_email", email.toLowerCase())
      .eq("tier", tier);

    if ((count ?? 0) >= tierConfig.maxFiles) {
      return NextResponse.json(
        { error: `Upload limit reached. ${tier === "blueprint" ? "Blueprint™" : "Blueprint+™"} allows up to ${tierConfig.maxFiles} assets.` },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileId = randomUUID();
    const ext = file.name.split(".").pop() || "bin";
    const storagePath = `${email.toLowerCase()}/${sessionId || "direct"}/${fileId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await sb.storage
      .from("brand-assets")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Asset Upload] Storage error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 }
      );
    }

    // Save metadata
    const category = categorizeAsset(file.name, file.type);
    const { data: record, error: dbError } = await sb
      .from("brand_asset_uploads")
      .insert({
        user_email: email.toLowerCase(),
        session_id: sessionId,
        tier,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        asset_category: category,
      })
      .select("id, file_name, file_type, file_size, asset_category, created_at")
      .single();

    if (dbError) {
      console.error("[Asset Upload] DB error:", dbError);
      // Clean up the uploaded file
      await sb.storage.from("brand-assets").remove([storagePath]);
      return NextResponse.json(
        { error: "Failed to save upload record." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      asset: record,
      remaining: tierConfig.maxFiles - ((count ?? 0) + 1),
    });
  } catch (err) {
    console.error("[Asset Upload] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
