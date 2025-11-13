import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request, { params }: any) {
  const { id } = params;
  const supabase = supabaseServer();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}
