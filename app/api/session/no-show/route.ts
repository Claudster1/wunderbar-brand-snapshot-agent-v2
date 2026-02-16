// POST /api/session/no-show
// Manually mark a contact as a no-show for a booked session.
// Use this when marking no-shows outside of Calendly (e.g., Zoom no-shows).
//
// Requires ADMIN_API_KEY in Authorization header.

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const VALID_SESSION_TYPES = ["talk_to_expert", "activation_session"] as const;
type SessionType = (typeof VALID_SESSION_TYPES)[number];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "").trim();

  if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, session_type, name, scheduled_date, notes } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!session_type || !VALID_SESSION_TYPES.includes(session_type)) {
      return NextResponse.json(
        { error: `session_type must be one of: ${VALID_SESSION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const firstName = name ? name.split(" ")[0] : "";
    const sessionLabel = session_type === "talk_to_expert"
      ? "Talk to an Expert"
      : "Strategy Activation Session";

    logger.info("[No-Show] Processing", { email: normalizedEmail, session_type });

    const { applyActiveCampaignTags, setContactFields, getOrCreateContactId } =
      await import("@/lib/applyActiveCampaignTags");
    const { fireACEvent } = await import("@/lib/fireACEvent");

    // Sync contact
    if (firstName) {
      await getOrCreateContactId(normalizedEmail, { firstName });
    }

    // Tag
    const noShowTag = session_type === "talk_to_expert"
      ? "call:expert-no-show"
      : "session:activation-no-show";

    await applyActiveCampaignTags({
      email: normalizedEmail,
      tags: [noShowTag, "noshow:needs-followup"],
    });

    // Set fields
    await setContactFields({
      email: normalizedEmail,
      fields: {
        last_noshow_type: sessionLabel,
        last_noshow_date: scheduled_date || new Date().toISOString().split("T")[0],
        ...(firstName ? { first_name_custom: firstName } : {}),
      },
    });

    // Fire event
    const eventName = session_type === "talk_to_expert"
      ? "expert_call_no_show"
      : "activation_session_no_show";

    await fireACEvent({
      email: normalizedEmail,
      eventName,
      tags: [noShowTag],
      fields: {
        first_name: firstName,
        session_type: sessionLabel,
        noshow_date: scheduled_date || new Date().toISOString().split("T")[0],
        ...(notes ? { notes } : {}),
      },
    });

    logger.info("[No-Show] Tagged and event fired", { email: normalizedEmail, session_type });

    return NextResponse.json({
      success: true,
      message: `${normalizedEmail} marked as no-show for ${sessionLabel}. AC automation triggered.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error("[No-Show] Error", { error: msg });
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
