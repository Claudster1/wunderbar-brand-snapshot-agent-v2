// src/services/openaiService.ts

import type { BrandChatMessage } from '../types';
import type { BrandSnapshotChatResponse } from '@/lib/intake/intakeTypes';
import type { BrandSnapshotSseEvent } from '@/lib/intake/brandSnapshotSse';

const API_URL = '/api/brand-snapshot';

/** Browser fetch can hang on slow proxies — bail out so the UI can recover (transcript finalize, retry). */
const BRAND_SNAPSHOT_CHAT_TIMEOUT_MS = 95_000;
/** Auto-retry traffic limits so a paced Blueprint+ session can finish without a manual Retry. */
const CHAT_RATE_LIMIT_RETRIES = 3;
const CHAT_RATE_LIMIT_WAIT_CAP_SEC = 45;

type ApiMessage = { role: 'user' | 'assistant'; content: string };
type ProductTier = 'snapshot' | 'snapshot-plus' | 'blueprint' | 'blueprint-plus';

const buildApiMessages = (history: BrandChatMessage[]): ApiMessage[] =>
  history.map((message) => ({
    role: message.role,
    content: message.text,
  }));

function buildPayload(
  history: BrandChatMessage[],
  options?: {
    productTier?: ProductTier;
    continuationReportId?: string | null;
    reportId?: string | null;
    stream?: boolean;
  },
) {
  const payload: {
    messages: ReturnType<typeof buildApiMessages>;
    productTier?: ProductTier;
    continuationReportId?: string;
    reportId?: string;
    stream?: boolean;
  } = {
    messages: buildApiMessages(history),
    productTier: options?.productTier,
    stream: options?.stream,
  };
  if (options?.continuationReportId) {
    payload.continuationReportId = options.continuationReportId;
  }
  const reportId = options?.reportId || options?.continuationReportId;
  if (reportId) {
    payload.reportId = reportId;
  }
  return payload;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfterSeconds(response: Response): number {
  const raw = response.headers.get('Retry-After');
  const parsed = Number.parseInt(raw || '', 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.min(CHAT_RATE_LIMIT_WAIT_CAP_SEC, Math.max(2, parsed));
  }
  return 3;
}

/** Fetch chat; on 429 wait for Retry-After and retry (does not consume stream body). */
async function fetchBrandSnapshot(
  body: ReturnType<typeof buildPayload>,
  signal: AbortSignal,
): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 0; attempt <= CHAT_RATE_LIMIT_RETRIES; attempt++) {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    last = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if (last.status !== 429 || attempt === CHAT_RATE_LIMIT_RETRIES) {
      return last;
    }
    await sleep(retryAfterSeconds(last) * 1000);
  }
  return last!;
}

function parseSseEvents(buffer: string): { events: BrandSnapshotSseEvent[]; rest: string } {
  const events: BrandSnapshotSseEvent[] = [];
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const part of parts) {
    const line = part.trim();
    if (!line.startsWith('data:')) continue;
    try {
      events.push(JSON.parse(line.slice(5).trim()) as BrandSnapshotSseEvent);
    } catch {
      /* ignore partial */
    }
  }
  return { events, rest };
}

export async function streamBrandSnapshotReply(
  history: BrandChatMessage[],
  options: {
    productTier?: ProductTier;
    continuationReportId?: string | null;
    reportId?: string | null;
    onToken: (text: string) => void;
    signal?: AbortSignal;
  },
): Promise<BrandSnapshotChatResponse> {
  const controller = new AbortController();
  const timeoutMs = BRAND_SNAPSHOT_CHAT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetchBrandSnapshot(
      buildPayload(history, { ...options, stream: true }),
      controller.signal,
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage =
        response.status === 429
          ? 'We hit a temporary traffic limit. Your progress is saved — tap Retry in a moment to continue.'
          : 'There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && response.status !== 429) errorMessage = errorData.error;
      } catch {
        /* default */
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Streaming is not supported in this browser.');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let donePayload: BrandSnapshotChatResponse | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseEvents(buffer);
      buffer = parsed.rest;
      for (const event of parsed.events) {
        if (event.type === 'token') {
          options.onToken(event.text);
        } else if (event.type === 'done') {
          donePayload = {
            content: event.content,
            meta: event.meta as BrandSnapshotChatResponse['meta'],
            _ai: event._ai,
          };
        } else if (event.type === 'error') {
          throw new Error(event.message);
        }
      }
    }

    if (!donePayload?.content) {
      throw new Error('Sorry, I had trouble generating a response. Please try again.');
    }
    return donePayload;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getBrandSnapshotReply(
  history: BrandChatMessage[],
  options?: {
    productTier?: ProductTier;
    continuationReportId?: string | null;
    reportId?: string | null;
    stream?: boolean;
    onToken?: (text: string) => void;
    signal?: AbortSignal;
  },
): Promise<BrandSnapshotChatResponse> {
  if (options?.stream && options.onToken) {
    return streamBrandSnapshotReply(history, {
      productTier: options.productTier,
      continuationReportId: options.continuationReportId,
      reportId: options.reportId,
      onToken: options.onToken,
      signal: options.signal,
    });
  }

  const controller = new AbortController();
  const timeoutMs = BRAND_SNAPSHOT_CHAT_TIMEOUT_MS;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (typeof setTimeout !== 'undefined') {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }
  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetchBrandSnapshot(buildPayload(history, options), controller.signal);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage =
        response.status === 429
          ? 'We hit a temporary traffic limit. Your progress is saved — tap Retry in a moment to continue.'
          : 'There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && response.status !== 429) errorMessage = errorData.error;
      } catch {
        /* default */
      }
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as BrandSnapshotChatResponse;
    if (!data?.content) {
      throw new Error('Sorry, I had trouble generating a response. Please try again.');
    }
    return { content: data.content, meta: data.meta, _ai: data._ai };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `The chat timed out after ${timeoutMs / 1000}s. Your replies are saved — we'll try generating your diagnostic from the transcript.`,
      );
    }
    if (err instanceof Error) throw err;
    throw new Error(
      'There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export type { BrandChatMessage };
