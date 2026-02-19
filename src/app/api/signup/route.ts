import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createClient();
  
  const { username, role, email, password, interests } = body;
  
  console.log(interests);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, role, interests},
    },
  });

  console.log(error)
  const userId = data.user?.id;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json(
      { error: "User ID not returned" },
      { status: 500 }
    );
  }


  return NextResponse.json({ message: "Signup successful" });
}
