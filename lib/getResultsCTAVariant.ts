export function getResultsCTAVariant(reportId: string): "A" | "B" {
  let hash = 0;
  for (let i = 0; i < reportId.length; i++) {
    hash = reportId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}
