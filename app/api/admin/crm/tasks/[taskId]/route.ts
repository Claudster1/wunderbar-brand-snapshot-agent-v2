import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createCrmActivity } from "@/lib/crm/inbound";
import { sanitizeString } from "@/lib/security/inputValidation";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ALLOWED_STATUS = ["open", "done", "cancelled"];

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const auth = req.headers.get("authorization") || "";
  return auth.replace("Bearer ", "").trim() === ADMIN_API_KEY;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const { taskId } = await params;
  const body = await req.json();
  const status = typeof body.status === "string" ? body.status : null;
  const title = typeof body.title === "string" ? sanitizeString(body.title) : null;
  const assignedTo =
    typeof body.assignedTo === "string" ? sanitizeString(body.assignedTo) : null;
  const dueAt = typeof body.dueAt === "string" ? body.dueAt : null;

  if (!status && !title && !assignedTo && !dueAt) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }
  if (status && !ALLOWED_STATUS.includes(status)) {
    return NextResponse.json({ error: "Invalid task status." }, { status: 400 });
  }

  const { data: task, error: taskError } = await supabaseAdmin
    .from("crm_tasks")
    .select("id, inquiry_id, contact_id, status, title")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (status) updates.status = status;
  if (title) updates.title = title;
  if (assignedTo) updates.assigned_to = assignedTo;
  if (dueAt) updates.due_at = dueAt;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("crm_tasks")
    .update(updates)
    .eq("id", taskId)
    .select("id, title, status, due_at, assigned_to, updated_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: "Failed to update task." }, { status: 500 });
  }

  if (status) {
    await createCrmActivity({
      inquiryId: task.inquiry_id,
      contactId: task.contact_id,
      activityType: "task_status_changed",
      body: `Task "${task.title}" marked ${status}`,
      payload: { taskId, from: task.status, to: status },
      createdBy: "admin",
    });
  }

  if (title || assignedTo || dueAt) {
    await createCrmActivity({
      inquiryId: task.inquiry_id,
      contactId: task.contact_id,
      activityType: "task_updated",
      body: `Task "${task.title}" details updated`,
      payload: {
        taskId,
        title: title || undefined,
        assigned_to: assignedTo || undefined,
        due_at: dueAt || undefined,
      },
      createdBy: "admin",
    });
  }

  return NextResponse.json({ success: true, task: updated });
}
