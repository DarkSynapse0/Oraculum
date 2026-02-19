import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { notificationId, all } = await req.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let query = supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id);

  // If notificationId is provided, update only one. Otherwise, update all for user.
  if (!all && notificationId) {
    query = query.eq("id", notificationId);
  } else {
    query = query.eq("is_read", false);
  }

  const { error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
