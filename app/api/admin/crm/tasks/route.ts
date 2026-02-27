import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCrmActivity } from "@/lib/crm/inbound";
import { sanitizeString } from "@/lib/security/inputValidation";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const body = await req.json();
  const inquiryId = typeof body.inquiryId === "string" ? body.inquiryId : "";
  const title =
    typeof body.title === "string" ? sanitizeString(body.title).trim() : "";
  const assignedTo =
    typeof body.assignedTo === "string" ? sanitizeString(body.assignedTo) : null;
  const dueAt = typeof body.dueAt === "string" ? body.dueAt : null;

  if (!inquiryId || !title) {
    return NextResponse.json(
      { error: "inquiryId and title are required." },
      { status: 400 },
    );
  }

  const { data: inquiry, error: inquiryError } = await supabaseAdmin
    .from("crm_inquiries")
    .select("id, contact_id")
    .eq("id", inquiryId)
    .single();
  if (inquiryError || !inquiry) {
    return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  }

  const { data: task, error: taskError } = await supabaseAdmin
    .from("crm_tasks")
    .insert({
      inquiry_id: inquiryId,
      contact_id: inquiry.contact_id,
      title,
      status: "open",
      due_at: dueAt || null,
      assigned_to: assignedTo || null,
    })
    .select("id, title, status, due_at, assigned_to, created_at, updated_at")
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: "Failed to create task." }, { status: 500 });
  }

  await createCrmActivity({
    inquiryId,
    contactId: inquiry.contact_id,
    activityType: "task_created",
    body: `Task "${title}" created`,
    payload: {
      taskId: task.id,
      due_at: dueAt || null,
      assigned_to: assignedTo || null,
    },
    createdBy: "admin",
  });

  return NextResponse.json({ success: true, task });
}
