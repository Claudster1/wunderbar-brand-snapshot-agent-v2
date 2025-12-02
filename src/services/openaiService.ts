// src/services/openaiService.ts

import type { BrandChatMessage } from '../types';

const API_URL = '/api/brand-snapshot';

type ApiMessage = { role: 'system' | 'user' | 'assistant'; content: string };

// Build messages array - system prompt is added by the API handler
const buildApiMessages = (history: BrandChatMessage[]): ApiMessage[] => 
  history.map((message) => ({
    role: message.role,
    content: message.text,
  }));

export async function getBrandSnapshotReply(
  history: BrandChatMessage[]
): Promise<string> {
  const payload = { messages: buildApiMessages(history) };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(
        '[Brand Snapshot Agent] API error:',
        response.status,
        response.statusText,
        errorText
      );
      
      let errorMessage = 'There was an issue reaching the Brand Snapshot specialist. Please try again in a moment.';
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
      console.error('[Brand Snapshot Agent] No content in response:', data);
      throw new Error('Sorry, I had trouble generating a response. Please try again.');
    }
    
    return content;
  } catch (err: any) {
    console.error('[Brand Snapshot Agent] Fetch error:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('There was an issue reaching the Brand Snapshot specialist. Please try again in a moment.');
  }
}

export type { BrandChatMessage };
