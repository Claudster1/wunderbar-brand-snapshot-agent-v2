// app/api/user/access/route.ts
// API route to get user product access

import { NextResponse } from "next/server";
import { getUserProductAccess } from "@/lib/getUserProductAccess";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter" },
        { status: 400 }
      );
    }

    const access = await getUserProductAccess(email);

    return NextResponse.json({ access });
  } catch (err: any) {
    console.error("[User Access API] Error:", err);
    return NextResponse.json(
      { error: "Failed to get user access" },
      { status: 500 }
    );
  }
}
