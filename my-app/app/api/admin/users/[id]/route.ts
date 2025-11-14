import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/checkAdmin";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin.ok)
    return NextResponse.json({ error: admin.error }, { status: 403 });

  const { id } = await context.params;

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user: data });
}
