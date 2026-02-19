import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const supabase = createClient();

    if (!query || !query.trim()) {
      return NextResponse.json({ data: [] });
    }

    const trimmedQuery = query.trim();

    const { data, error } = await(await supabase)
      .from("posts")
      .select(
        `
        id,
        title,
        context,
        author,
        category,
        tags,
        upvotes,
        downvotes,
        answers_count,
        created_at,
        image_url
      `
      )
      .or(
        `title.ilike.%${trimmedQuery}%,context.ilike.%${trimmedQuery}%,category.ilike.%${trimmedQuery}%,author.ilike.%${trimmedQuery}%,tags.cs.{${trimmedQuery}}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Invalid search request" },
      { status: 400 }
    );
  }
}
