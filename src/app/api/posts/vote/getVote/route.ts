/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/client";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { postId, userId } = await req.json();

    const { data: existingVote } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    return new Response(
      JSON.stringify({ voteType: existingVote?.vote_type || null }),
      {
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}
