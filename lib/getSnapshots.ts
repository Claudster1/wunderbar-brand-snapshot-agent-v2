// lib/getSnapshots.ts
// Function to get user's Brand Snapshots (alias for getUserSnapshots)

import { getUserSnapshots } from "./getUserSnapshots";

export async function getSnapshots() {
  return getUserSnapshots();
}
