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

export async function DELETE(req: Request, { params }: any) {
    const { id } = params;
    const supabase = supabaseServer();
  
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    // Verify ownership
    const { data: post } = await supabase
      .from("posts")
      .select("author")
      .eq("id", id)
      .single();
  
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
    if (post.author !== user.id) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
  
    await supabase.from("posts").delete().eq("id", id);
  
    return NextResponse.json({ message: "Deleted" });
  }
  