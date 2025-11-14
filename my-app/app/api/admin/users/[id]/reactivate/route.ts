import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminUtil";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  // Update user role in profiles table
  const { error } = await admin.supabase
    .from("profiles")
    .update({ role: "user" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "User reactivated" });
}
