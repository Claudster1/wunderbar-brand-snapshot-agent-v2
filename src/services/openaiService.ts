// src/services/openaiService.ts

import type { BrandChatMessage } from '../types';

const API_URL = '/api/brand-snapshot';

/** Browser fetch can hang on slow proxies — bail out so the UI can recover (transcript finalize, retry). */
const BRAND_SNAPSHOT_CHAT_TIMEOUT_MS = 95_000;

type ApiMessage = { role: 'user' | 'assistant'; content: string };
type ProductTier = 'snapshot' | 'snapshot-plus' | 'blueprint' | 'blueprint-plus';

// Build messages array - system prompt is added by the API handler
// IMPORTANT: Only send user and assistant messages, never system messages
// The BrandChatMessage type only allows 'user' | 'assistant' roles, so system messages are already prevented
const buildApiMessages = (history: BrandChatMessage[]): ApiMessage[] => 
  history.map((message) => ({
    role: message.role,
    content: message.text,
  }));

export async function getBrandSnapshotReply(
  history: BrandChatMessage[],
  options?: { productTier?: ProductTier; continuationReportId?: string | null }
): Promise<string> {
  const payload: {
    messages: ReturnType<typeof buildApiMessages>;
    productTier?: ProductTier;
    continuationReportId?: string;
  } = {
    messages: buildApiMessages(history),
    productTier: options?.productTier,
  };
  if (options?.continuationReportId) {
    payload.continuationReportId = options.continuationReportId;
  }

  const controller = new AbortController();
  const timeoutMs = BRAND_SNAPSHOT_CHAT_TIMEOUT_MS;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (typeof setTimeout !== 'undefined') {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(
        '[WunderBrand Snapshot™ Agent] API error:',
        response.status,
        response.statusText,
        errorText
      );
      
      let errorMessage = 'There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Use default error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data?.content;
    
    if (!content) {
      console.error('[WunderBrand Snapshot™ Agent] No content in response:', data);
      throw new Error('Sorry, I had trouble generating a response. Please try again.');
    }
    
    return content;
  } catch (err: any) {
    console.error('[WunderBrand Snapshot™ Agent] Fetch error:', err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `The chat timed out after ${timeoutMs / 1000}s. Your replies are saved — we'll try generating your diagnostic from the transcript.`,
      );
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('There was an issue reaching the WunderBrand Snapshot™ specialist. Please try again in a moment.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export type { BrandChatMessage };
