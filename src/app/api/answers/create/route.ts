/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { moderateContent } from "@/lib/moderation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, content, userId } = body;

    if (!postId || !content || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Moderation
    const moderationResult = await moderateContent({
      title: "",
      context: content,
    });
    if (moderationResult.flagged) {
      return NextResponse.json(
        {
          error: "Inappropriate content detected",
          message: moderationResult.message,
        },
        { status: 422 },
      );
    }

    const supabase = await createClient();

    // 2. Insert the Answer
    // Based on your code, the column is 'question_id' and 'answer_text'
    const { data: answerData, error: answerError } = await supabase
      .from("answers")
      .insert({
        question_id: postId,
        user_id: userId,
        answer_text: content,
        likes: 0,
      })
      .select(
        `
          id,
          answer_text,
          user_id,
          created_at,
          profiles (username)
      `,
      )
      .single();

    if (answerError) throw answerError;

    // 3. TRIGGER NOTIFICATION (Manual Lookup)
    try {
      // We look up the 'posts' table using the 'postId' provided in the request
      const { data: originalPost } = await supabase
        .from("posts")
        .select("user_id, title")
        .eq("id", postId)
        .single();

      // Only notify if post owner is NOT the person who just answered
      if (originalPost && originalPost.user_id !== userId) {
        await supabase.from("notifications").insert({
          user_id: originalPost.user_id, // Recipient
          actor_id: userId, // Actor
          category: "comment",
          content: `answered your post: "${originalPost.title.slice(0, 25)}..."`,
          link: `/dashboard/view/${postId}`,
          is_read: false,
        });
      }
    } catch (notifErr) {
      console.error("[Notification_System_Error]:", notifErr);
    }

    // 4. Return response
    return NextResponse.json({
      data: {
        id: answerData.id,
        content: answerData.answer_text,
        user_id: answerData.user_id,
        username: (answerData.profiles as any).username,
        created_at: answerData.created_at,
      },
    });
  } catch (err: any) {
    console.error("Answer creation error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
