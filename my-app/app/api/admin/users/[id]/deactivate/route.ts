import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/checkAdmin";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin.ok)
    return NextResponse.json({ error: admin.error }, { status: 403 });

  const { id } = await context.params;
  const supabase = supabaseServer();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "deactivated" })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "User deactivated" });
}
