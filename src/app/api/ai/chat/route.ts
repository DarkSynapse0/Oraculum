/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { analyzeComment, askAcademicAssistant } from "@/lib/analyzer";
import { createClient } from "@/utils/supabase/server";

const COST_PER_QUESTION = 10;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("reputation_points")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if ((profile.reputation_points ?? 0) < COST_PER_QUESTION) {
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
    } catch (err) {
      console.error("AI assistant failed:", err);
      return NextResponse.json(
        { error: "AI service temporarily unavailable." },
        { status: 500 },
      );
    }

    const newReputation = (profile.reputation_points ?? 0) - COST_PER_QUESTION;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ reputation_points: newReputation })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to deduct reputation:", updateError);
      return NextResponse.json(
        { error: "Failed to update reputation points." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      reply: aiReply,
      reputation: newReputation,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
