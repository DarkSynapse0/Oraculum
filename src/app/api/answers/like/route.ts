/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export async function POST(req: Request) {
  try {
    const { answerId, userId } = await req.json();
    const supabase = await createClient();

    if (!answerId || !userId) {
      return NextResponse.json(
        { error: "answerId and userId are required" },
        { status: 400 },
      );
    }

    const { data: userExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!userExists) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const { data: answerData, error: fetchError } = await supabase
      .from("answers")
      .select("likes")
      .eq("id", answerId)
      .maybeSingle();

    if (fetchError || !answerData) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    const currentLikes = answerData.likes ?? 0;

    const { data: existingLike } = await supabase
      .from("answer_likes")
      .select("id")
      .eq("answer_id", answerId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("answer_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) throw deleteError;

      const { error: decError } = await supabase
        .from("answers")
        .update({ likes: currentLikes - 1 })
        .eq("id", answerId);

      if (decError) throw decError;

      return NextResponse.json({ liked: false, likes: currentLikes - 1 });
    } else {
      const { error: insertError } = await supabase
        .from("answer_likes")
        .insert([{ answer_id: answerId, user_id: userId }]);

      if (insertError) throw insertError;

      console.log(currentLikes);

      const { error: incError } = await supabase
        .from("answers")
        .update({ likes: currentLikes + 1 })
        .eq("id", answerId);

      if (incError) throw incError;

      return NextResponse.json({ liked: true, likes: currentLikes + 1 });
    }
  } catch (err: any) {
    console.error("[Answer Like Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
