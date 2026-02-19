/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();

    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "Post ID is required" }), {
        status: 400,
      });
    }

    const { data, error } = await( await supabase)
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }
}
