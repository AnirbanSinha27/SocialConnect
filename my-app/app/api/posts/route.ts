import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, image_url, category } = body;

  if (!content || content.length > 280) {
    return NextResponse.json(
      { error: "Content must be <= 280 chars" },
      { status: 400 }
    );
  }

  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content,
      image_url,
      author: user.id,
      category: category || "general",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
