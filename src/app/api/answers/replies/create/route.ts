/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { answerId, content, userId } = await req.json();

    if (!answerId || !content || !userId) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // 1. Insert the Reply
    const { data, error } = await supabase
      .from("answer_replies")
      .insert({
        answer_id: answerId,
        user_id: userId,
        content,
      })
      .select(`
        id,
        answer_id,
        content,
        created_at,
        user_id,
        profiles!user_id ( username )
      `)
      .single();

    if (error) throw error;

    // 2. TRIGGER NOTIFICATION (Recovery & Dispatch)
    try {
      // Find the author of the original Answer and the Post it belongs to
      const { data: parentAnswer } = await supabase
        .from("answers")
        .select("user_id, post_id")
        .eq("id", answerId)
        .single();

      if (parentAnswer && parentAnswer.user_id !== userId) {
        await supabase.from("notifications").insert({
          user_id: parentAnswer.user_id, // Recipient: Author of the answer
          actor_id: userId,             // Actor: The person replying
          category: "comment",
          content: `replied to your comment: "${content.slice(0, 40)}..."`,
          link: `/dashboard/view/${parentAnswer.post_id}`,
          is_read: false,
        });
      }
    } catch (notifErr) {
      console.error("[Notification_System_Error]:", notifErr);
      // We don't return an error to the user if only the notification fails
    }

    // 3. Format response for the frontend
    const formatted = {
      id: data.id,
      answer_id: data.answer_id,
      content: data.content,
      created_at: data.created_at,
      user_id: data.user_id,
      username: (data.profiles as any).username,
    };

    return NextResponse.json({ data: formatted });

  } catch (err: any) {
    console.error("[Reply_Creation_Error]:", err.message);
    return NextResponse.json(
      { message: "Failed to create reply" },
      { status: 500 }
    );
  }
}