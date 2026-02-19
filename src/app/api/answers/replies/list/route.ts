/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/answers/replies/list.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { answerId } = await req.json();

  if (!answerId) {
    return NextResponse.json({ message: "answerId required" }, { status: 400 });
  }

  const { data, error } = await( await supabase)
    .from("answer_replies")
    .select(
      `
      id,
      content,
      created_at,
      user_id,
      profiles (
        username
      )
    `,
    )
    .eq("answer_id", answerId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch replies" },
      { status: 500 },
    );
  }

  const formatted = (data || []).map((r: any) => ({
    id: r.id,
    answer_id: answerId,
    content: r.content,
    created_at: r.created_at,
    user_id: r.user_id,
    username: r.profiles.username,
  }));

  return NextResponse.json({ data: formatted });
}
