import { NextResponse } from "next/server";
import { apiGuard } from "@/lib/security/apiGuard";
import { AI_RATE_LIMIT } from "@/lib/security/rateLimit";
import { completeWithFallback, type ChatMessage } from "@/lib/ai";
import { SNAPSHOT_TRANSCRIPT_EXTRACT_SYSTEM } from "@/src/prompts/snapshotTranscriptExtractPrompt";
import { snapshotAnswersRecordSchema } from "@/lib/snapshot/snapshotAnswersSchema";
import {
  buildFallbackAnswersFromMessages,
  mergeExtractedWithFallback,
} from "@/lib/intake/transcriptAnswerFallback";
import { mergePriorWithExtracted } from "@/lib/intake/mergePriorAnswers";
import {
  CONTINUATION_REPORT_UUID_RE,
  loadPriorSnapshotAnswers,
} from "@/lib/intake/loadPriorSnapshotAnswers";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type IncomingMsg = { role?: string; text?: string; content?: string };

function transcriptFromMessages(messages: IncomingMsg[]): string {
  return messages
    .map((m) => {
      const role = m.role === "assistant" ? "Assistant" : "User";
      const body = (typeof m.text === "string" ? m.text : typeof m.content === "string" ? m.content : "").trim();
      return body ? `${role}: ${body}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function toIntakeMessages(messages: IncomingMsg[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: typeof m.text === "string" ? m.text : typeof m.content === "string" ? m.content : "",
  }));
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim();
  const tryParse = (s: string) => {
    try {
      const v = JSON.parse(s) as unknown;
      return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };

  let parsed = tryParse(trimmed);
  if (parsed) return parsed;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    parsed = tryParse(fence[1].trim());
    if (parsed) return parsed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    parsed = tryParse(trimmed.slice(start, end + 1));
    if (parsed) return parsed;
  }

  return null;
}

async function extractWithModel(
  transcript: string,
  tierNote: string,
  repairHint?: string,
): Promise<string> {
  const aiMessages: ChatMessage[] = [
    { role: "system", content: SNAPSHOT_TRANSCRIPT_EXTRACT_SYSTEM },
    {
      role: "user",
      content: repairHint
        ? `${tierNote}\n\nREPAIR: ${repairHint}\n\n--- CHAT TRANSCRIPT ---\n\n${transcript}`
        : `${tierNote}\n\n--- CHAT TRANSCRIPT ---\n\n${transcript}`,
    },
  ];

  const completion = await completeWithFallback("snapshot_transcript_extract", {
    messages: aiMessages,
  });

  return completion.content?.trim() || "";
}

function resolveAnswers(
  messages: IncomingMsg[],
  extracted: Record<string, unknown> | null,
  priorAnswers?: Record<string, unknown> | null,
): { answers: Record<string, unknown> | null; usedFallback: boolean } {
  const intakeMsgs = toIntakeMessages(messages);

  if (extracted && Object.keys(extracted).length > 0) {
    let merged = mergeExtractedWithFallback(extracted, intakeMsgs);
    if (priorAnswers) merged = mergePriorWithExtracted(priorAnswers, merged);
    const parsed = snapshotAnswersRecordSchema.safeParse(merged);
    if (parsed.success) {
      return { answers: parsed.data, usedFallback: false };
    }
    logger.warn("[complete-from-transcript] Schema failed after merge", {
      issue: parsed.error.issues[0]?.message,
    });
  }

  let fallbackOnly = buildFallbackAnswersFromMessages(intakeMsgs);
  if (priorAnswers) fallbackOnly = mergePriorWithExtracted(priorAnswers, fallbackOnly);
  const fallbackParsed = snapshotAnswersRecordSchema.safeParse(fallbackOnly);
  if (fallbackParsed.success) {
    return { answers: fallbackParsed.data, usedFallback: true };
  }

  return { answers: null, usedFallback: true };
}

export async function POST(req: Request) {
  const guard = apiGuard(req, {
    routeId: "snapshot_transcript",
    rateLimit: AI_RATE_LIMIT,
    maxBodySize: 400_000,
  });
  if (!guard.passed) return guard.errorResponse;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      messages?: IncomingMsg[];
      productTier?: string;
      continuationReportId?: string;
    };

    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length < 4) {
      return NextResponse.json({ error: "Not enough conversation to extract answers." }, { status: 400 });
    }

    const transcript = transcriptFromMessages(messages);
    if (transcript.length < 120) {
      return NextResponse.json({ error: "Transcript too short." }, { status: 400 });
    }

    const tierNote =
      typeof body.productTier === "string" && body.productTier.trim()
        ? `Product tier (for field depth): ${body.productTier.trim()}.`
        : "";

    const continuationId =
      typeof body.continuationReportId === "string" ? body.continuationReportId.trim() : "";
    const priorAnswers =
      continuationId && CONTINUATION_REPORT_UUID_RE.test(continuationId)
        ? await loadPriorSnapshotAnswers(continuationId)
        : null;

    let content = await extractWithModel(transcript, tierNote);
    let extracted = extractJsonObject(content);

    if (!extracted) {
      logger.warn("[complete-from-transcript] No JSON in first pass", {
        preview: content.slice(0, 200),
      });
      content = await extractWithModel(
        transcript,
        tierNote,
        "Your previous reply was not valid JSON. Reply with ONLY one JSON object matching the required shape.",
      );
      extracted = extractJsonObject(content);
    }

    let { answers, usedFallback } = resolveAnswers(messages, extracted, priorAnswers);

    if (!answers) {
      return NextResponse.json(
        { error: "Could not extract structured answers. Try again in a moment." },
        { status: 422 },
      );
    }

    return NextResponse.json({ answers, usedFallback });
  } catch (err: unknown) {
    logger.error("[complete-from-transcript]", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to complete from transcript." }, { status: 500 });
  }
}
