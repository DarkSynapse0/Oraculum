import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { username, role, interests } = await req.json();

  if (!username) {
    return NextResponse.json(
      { message: "Username is required" },
      { status: 400 },
    );
  }

  const updatedAtNepal = (() => {
    const now = new Date();
    const offset = 5 * 60 + 45;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + offset * 60000).toISOString();
  })();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username,
      role,
      interests,
      updated_at: updatedAtNepal,
    })
    .eq("id", user.id)
    .select("id, username, role, created_at, avatar_url, interests")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
