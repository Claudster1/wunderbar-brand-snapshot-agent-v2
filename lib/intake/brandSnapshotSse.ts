export type BrandSnapshotSseEvent =
  | { type: "token"; text: string }
  | { type: "done"; content: string; meta?: unknown; _ai?: { provider: string; model: string } }
  | { type: "error"; message: string };

export function encodeBrandSnapshotSse(event: BrandSnapshotSseEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}
