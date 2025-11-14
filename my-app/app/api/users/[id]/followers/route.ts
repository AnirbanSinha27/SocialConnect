import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 🟢 FIXED

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("follows")
    .select("follower")
    .eq("following", id);

  if (error) {
    console.error("Followers error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ followers: data });
}
