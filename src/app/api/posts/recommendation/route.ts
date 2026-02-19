import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await (await supabase)
      .from("profiles")
      .select("interests")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    if (!profile?.interests || profile.interests.length === 0) {
      const { data: trending } = await(await supabase)
        .from("posts")
        .select("*")
        .order("upvotes", { ascending: false })
        .limit(10);

      return NextResponse.json({
        type: "trending",
        posts: trending,
      });
    }

    const { data: posts } = await(await supabase)
      .from("posts")
      .select("*")
      .in("category", profile.interests)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({
      type: "interest_based",
      posts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
