/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { analyzeComment, askAcademicAssistant } from "@/lib/analyzer"; // moderation
import { createClient } from "@/utils/supabase/client";

const COST_PER_QUESTION = 10;

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, reputation_points")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.reputation_points < COST_PER_QUESTION) {
      return NextResponse.json(
        { error: "Not enough reputation points" },
        { status: 403 },
      );
    }

    const moderation = await analyzeComment(message);

    if ("error" in moderation) {
      return NextResponse.json({ error: moderation.error }, { status: 500 });
    }

    if (moderation.primary_classification === "toxic") {
      return NextResponse.json(
        { error: "Your question was blocked by moderation." },
        { status: 403 },
      );
    }

    let aiReply: string;
    try {
      aiReply = await askAcademicAssistant(message);
    } catch (err: any) {
      console.error("AI assistant failed:", err);
      return NextResponse.json(
        { error: "AI service temporarily unavailable." },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        reputation_points: profile.reputation_points - COST_PER_QUESTION,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to deduct reputation:", updateError);
      return NextResponse.json(
        { error: "Failed to update reputation points." },
        { status: 500 },
      );
    }

    return NextResponse.json({ reply: aiReply });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
