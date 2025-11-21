// src/services/openaiService.ts

export type ChatRole = 'system' | 'user' | 'assistant';

export interface BrandChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

/**
 * Calls the secure serverless function instead of OpenAI directly.
 */
export async function getBrandSnapshotReply(
  history: BrandChatMessage[]
): Promise<string> {
  try {
    const response = await fetch('/api/brand-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: history.map((m) => ({
          role: m.role,
          text: m.text,
        })),
      }),
    });

    if (!response.ok) {
      console.error('Brand Snapshot API error:', await response.text());
      return 'Something went wrong on the server. Please try again in a moment.';
    }

    const data: any = await response.json();
    return (
      data?.reply ??
      'I’m not sure what to say just yet. Can you try that again?'
    );
  } catch (err) {
    console.error('Network/parse error:', err);
    return 'I had trouble connecting to the server. Please check your connection and try again.';
  }
}
