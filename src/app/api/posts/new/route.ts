/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";
import { moderateContent } from "@/lib/moderation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const { user_id, title, context, author, category, tags, imageUrl } = body;

    // 1. Content Moderation
    const moderationResult = await moderateContent({ title, context });
    if (moderationResult.flagged) {
      return NextResponse.json(
        {
          error: "Inappropriate content detected.",
          message: moderationResult.message,
        },
        { status: 422 },
      );
    }

    // 2. Insert the Post (This is where the error was triggering)
    const { data: postData, error: postError } = await (
      await supabase
    )
      .from("posts")
      .insert([
        {
          title,
          user_id,
          context,
          author,
          category,
          tags,
          image_url: imageUrl,
          upvotes: 0,
          downvotes: 0,
          answers_count: 0,
          is_answered: false,
        },
      ])
      .select()
      .single();

    if (postError) throw postError;

    // 3. TRIGGER NOTIFICATIONS (Interest-Based / Same Course)
    if (postData && category) {
      try {
        // Query 'profiles' table using the 'interests' array
        const { data: targetUsers } = await (
          await supabase
        )
          .from("profiles")
          .select("id")
          .contains("interests", [category]) // Match category to user interests
          .not("id", "eq", user_id)
          .limit(50);

        if (targetUsers && targetUsers.length > 0) {
          const notificationPayload = targetUsers.map((target) => ({
            user_id: target.id,
            actor_id: user_id,
            category: "course_activity",
            content: `New post in ${category}: "${title.slice(0, 30)}..."`,
            link: `/dashboard/view/${postData.id}`,
          }));

          await (await supabase)
            .from("notifications")
            .insert(notificationPayload);
        }
      } catch (notifErr) {
        console.error(
          "Notification dispatch failed but post was created:",
          notifErr,
        );
      }
    }

    return NextResponse.json({ data: postData }, { status: 200 });
  } catch (err: any) {
    // This catches the "enrollments" error from the database
    console.error("[Post_Creation_Error]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
