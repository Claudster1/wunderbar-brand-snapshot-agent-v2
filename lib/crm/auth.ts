import { NextRequest } from "next/server";

export function hasAdminApiKey(req: NextRequest): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  return token === expected;
}

export function hasIngestSecret(req: NextRequest): boolean {
  const expected = process.env.CRM_INGEST_SECRET;
  if (!expected) return true;
  const headerSecret = req.headers.get("x-crm-ingest-secret") || "";
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.replace("Bearer ", "").trim();
  return headerSecret === expected || bearer === expected;
}
