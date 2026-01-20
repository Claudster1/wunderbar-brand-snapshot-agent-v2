export async function saveSnapshotProgress(payload: any) {
  await fetch("/api/save-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
