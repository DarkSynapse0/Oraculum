import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, role, created_at, avatar_url, interests")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(profile, { status: 200 });
}
