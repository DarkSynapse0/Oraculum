import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const supabase = await createClient();

  const { email, password } = data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "Login successful" });
}
