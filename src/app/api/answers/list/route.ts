/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type answers = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
  };
};

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    const supabase = createClient();

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 },
      );
    }

    const { data, error } = await (
      await supabase
    )
      .from("answers")
      .select(
        `
            id,
            answer_text,
            user_id,
            created_at,
            profiles (
        username
      )
        `,
      )
      .eq("question_id", postId)

      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = data.map((answers) => ({
      id: answers.id,
      content: answers.answer_text,
      user_id: answers.user_id,
      username: answers.profiles.username,
      created_at: answers.created_at,
    }));

    return NextResponse.json({ data: formatted });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
