/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/client";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();
    const { postId, userId, condition } = body;
    const { data: existingVote } = await supabase
      .from("post_votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    const { data: post } = await supabase
      .from("posts")
      .select("upvotes, downvotes")
      .eq("id", postId)
      .single();

    let upvotes = post?.upvotes || 0;
    let downvotes = post?.downvotes || 0;


    if (existingVote) {
      if (existingVote.vote_type === condition) {
        await supabase.from("post_votes").delete().eq("id", existingVote.id);

        if (condition === "upvote") upvotes -= 1;
        if (condition === "downvote") downvotes -= 1;
      } else {
        await supabase
          .from("post_votes")
          .update({ vote_type: condition })
          .eq("id", existingVote.id);

        if (condition === "upvote") {
          upvotes += 1;
          downvotes -= 1;
        }
        if (condition === "downvote") {
          downvotes += 1;
          upvotes -= 1;
        }
      }
    } else {
      await supabase.from("post_votes").insert({
        user_id: userId,
        post_id: postId,
        vote_type: condition,
      });

      if (condition === "upvote") upvotes += 1;
      if (condition === "downvote") downvotes += 1;
    }

    await supabase
      .from("posts")
      .update({ upvotes, downvotes })
      .eq("id", postId);

    return new Response(
      JSON.stringify({
        upvotes,
        downvotes,
        userVote:
          existingVote && existingVote.vote_type === condition
            ? null
            : condition,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}
