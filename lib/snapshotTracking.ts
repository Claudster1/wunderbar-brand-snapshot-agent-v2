// lib/snapshotTracking.ts
// Utility functions for tracking snapshot completion and views

import { trackEvent } from "./activeCampaignTracking";

export function markSnapshotCompleted() {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(
    "snapshot_completed_at",
    String(Date.now())
  );
  
  trackEvent("snapshot_completed", {});
}

export function markSnapshotPlusViewed() {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(
    "snapshot_plus_viewed",
    "true"
  );
  
  trackEvent("snapshot_plus_viewed", {});
}

export function checkSnapshotDropoff() {
  if (typeof window === "undefined") return;
  
  const completed = localStorage.getItem("snapshot_completed_at");
  const viewedPlus = localStorage.getItem("snapshot_plus_viewed");

  if (!completed || viewedPlus) return;

  const hours = (Date.now() - Number(completed)) / (1000 * 60 * 60);

  if (hours >= 24) {
    trackEvent("snapshot_dropoff_24h", {});
  }
}
